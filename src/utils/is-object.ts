export function isObject(val) {
  return Array.isArray(val) === false && typeof val === 'object' && val !== null;
}
