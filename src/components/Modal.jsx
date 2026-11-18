// Thin wrapper around the native <dialog> element. showModal() gives us a real
// modal for free: focus stays inside, Escape closes it, and focus returns to
// the button that opened it.
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useI18n } from "../i18n/useI18n.js";

export function Modal({ open, onClose, titleId, title, className = "", children }) {
  const { t } = useI18n();
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby={titleId}
      onClose={onClose}
      // A click on the dark backdrop lands on the <dialog> itself, not on its content.
      onClick={(e) => e.target === ref.current && onClose()}
    >
      {open && (
        <div className="modal-inner">
          <header className="modal-head">
            <h2 id={titleId}>{title}</h2>
            <button type="button" className="icon-btn icon-btn-sm" aria-label={t("dialog.close")} onClick={onClose}>
              <X size={16} aria-hidden="true" />
            </button>
          </header>
          {children}
        </div>
      )}
    </dialog>
  );
}
