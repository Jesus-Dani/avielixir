import { useEffect, useState } from "react";

/**
 * True only after the client has hydrated. Guards rendering of state that's
 * read from localStorage (cart, cart count) so the server-rendered markup
 * matches the client's first paint and React doesn't throw a hydration
 * mismatch.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard SSR/CSR hydration guard
    setMounted(true);
  }, []);
  return mounted;
}
