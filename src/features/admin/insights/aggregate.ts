export function countBy<T, K extends string>(items: T[], key: (item: T) => K | undefined) {
  const counts = {} as Record<K, number>;
  for (const item of items) {
    const k = key(item);
    if (k !== undefined) counts[k] = (counts[k] ?? 0) + 1;
  }
  return counts;
}

export function sumBy<T>(items: T[], value: (item: T) => number) {
  return items.reduce((total, item) => total + value(item), 0);
}

/** Ordered [key, count] pairs including zero-count keys. */
export function orderedCounts<K extends string>(counts: Partial<Record<K, number>>, order: readonly K[]) {
  return order.map((key) => ({ key, value: counts[key] ?? 0 }));
}
