export const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

type GAItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
};

type GAEvent =
  | { name: "view_item"; params: { currency: "NGN"; value: number; items: GAItem[] } }
  | { name: "add_to_cart"; params: { currency: "NGN"; value: number; items: GAItem[] } }
  | { name: "purchase"; params: { transaction_id: string; currency: "NGN"; value: number; items: GAItem[] } };

export function trackEvent(event: GAEvent) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event.name, event.params);
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}
