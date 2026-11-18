// City search with suggestions, following the ARIA combobox pattern:
// type → suggestions appear; ↑/↓ move, Enter picks, Escape closes (or clears).
// With an empty field it shows recent cities instead.
import { useId, useRef, useState } from "react";
import { History, Loader, MapPin, Search, X } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";
import { MIN_QUERY, useCitySearch } from "../hooks/useCitySearch.js";

export function CitySearch({ recent, onSelect }) {
  const { t, lang } = useI18n();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef(null);
  const id = useId();
  const search = useCitySearch(query, lang);

  const q = query.trim();
  const showRecent = q.length === 0;
  const options = showRecent ? recent : search.results;
  const listId = `${id}-list`;

  const pick = (place) => {
    onSelect(place);
    setQuery("");
    setOpen(false);
    setActive(-1);
    inputRef.current?.blur();
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) setOpen(true);
      if (options.length === 0) return;
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + options.length) % options.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const choice = options[active] ?? (search.status === "done" ? options[0] : null);
      if (choice) pick(choice);
      else setOpen(true); // shows the hint ("type at least 2 letters", "not found"…)
    } else if (e.key === "Escape") {
      if (open) setOpen(false);
      else setQuery("");
    }
  };

  // The message shown in the panel when there are no options to list.
  let message = null;
  if (showRecent && recent.length === 0) message = { text: t("search.empty") };
  else if (!showRecent && q.length < MIN_QUERY) message = { text: t("search.hint") };
  else if (!showRecent && search.status === "loading" && options.length === 0) message = { text: t("search.searching"), busy: true };
  else if (!showRecent && search.status === "error") message = { text: t(search.error === "offline" ? "search.offline" : "search.error") };
  else if (!showRecent && search.status === "done" && options.length === 0)
    message = { text: t("search.notFound", { q }), hint: t("search.notFoundHint") };

  const expanded = open && (options.length > 0 || message !== null);

  return (
    <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor={`${id}-input`} className="sr-only">{t("search.label")}</label>
      <Search size={18} className="search-icon" aria-hidden="true" />
      <input
        ref={inputRef}
        id={`${id}-input`}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={expanded && active >= 0 ? `${id}-opt-${active}` : undefined}
        autoComplete="off"
        spellCheck="false"
        placeholder={t("search.placeholder")}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      {search.status === "loading" && !showRecent && (
        <Loader size={16} className="search-spinner" aria-hidden="true" />
      )}
      {query && (
        <button
          type="button"
          className="search-clear"
          aria-label={t("search.clear")}
          onMouseDown={(e) => e.preventDefault()} // keep focus in the field
          onClick={() => {
            setQuery("");
            inputRef.current?.focus();
          }}
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}

      <div className={`search-panel${expanded ? " is-open" : ""}`}>
        {expanded && showRecent && options.length > 0 && (
          <p className="search-heading" id={`${id}-recent`}>{t("search.recent")}</p>
        )}
        <ul
          id={listId}
          role="listbox"
          aria-label={showRecent ? t("search.recent") : t("search.label")}
          hidden={!expanded || options.length === 0}
        >
          {options.map((place, i) => (
            <li
              key={`${place.id ?? "geo"}-${place.lat}-${place.lon}`}
              id={`${id}-opt-${i}`}
              role="option"
              aria-selected={i === active}
              className="search-option"
              onMouseDown={(e) => e.preventDefault()} // don't blur the input before the click
              onClick={() => pick(place)}
              onMouseEnter={() => setActive(i)}
            >
              {showRecent ? <History size={16} aria-hidden="true" /> : <MapPin size={16} aria-hidden="true" />}
              <span className="option-text">
                <span className="option-name">{place.name || t("locate.myLocation")}</span>
                <span className="option-meta">{[place.admin1, place.country].filter(Boolean).join(", ")}</span>
              </span>
              {place.countryCode && <span className="option-code" aria-hidden="true">{place.countryCode}</span>}
            </li>
          ))}
        </ul>
        {expanded && message && (
          <div className={`search-message${message.busy ? " is-busy" : ""}`}>
            <p>{message.text}</p>
            {message.hint && <p className="search-message-hint">{message.hint}</p>}
          </div>
        )}
      </div>

      {/* Screen readers hear the result count or the message, politely. */}
      <p className="sr-only" role="status">
        {open && !showRecent && search.status === "done" && options.length > 0
          ? t("search.results", { count: options.length })
          : open && message ? message.text : ""}
      </p>
    </form>
  );
}
