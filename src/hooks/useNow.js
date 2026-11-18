import { useEffect, useState } from "react";

// Re-renders every `ms` so clocks ("local time 14:05") stay current.
export function useNow(ms = 30000) {
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(timer);
  }, [ms]);
  return now;
}
