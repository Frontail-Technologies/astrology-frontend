/** One key per dialog open: a double-submit or replay of the same attempt is recorded once by the server. */
export const newIdempotencyKey = () => `adm-${crypto.randomUUID()}`;
