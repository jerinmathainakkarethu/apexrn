export function nextId(items) {
  return items.length ? Math.max(...items.map((item) => item.id || 0)) + 1 : 1;
}