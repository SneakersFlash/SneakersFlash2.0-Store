type FbqFn = (...args: unknown[]) => void;

declare global {
  interface Window { fbq?: FbqFn; }
}

function fbq(...args: unknown[]) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq(...args);
  }
}

export const pixel = {
  viewContent(p: { content_ids: string[]; content_name: string; value: number; currency: string }) {
    fbq('track', 'ViewContent', { ...p, content_type: 'product' });
  },
  addToCart(p: { content_ids: string[]; content_name: string; value: number; currency: string }) {
    fbq('track', 'AddToCart', { ...p, content_type: 'product' });
  },
  initiateCheckout(p: { num_items: number; value: number; currency: string }) {
    fbq('track', 'InitiateCheckout', p);
  },
  purchase(p: { value: number; currency: string; num_items: number; content_ids?: string[]; event_id?: string }) {
    const { event_id, ...rest } = p;
    fbq('track', 'Purchase', { ...rest, content_type: 'product' }, event_id ? { eventID: event_id } : undefined);
  },
};
