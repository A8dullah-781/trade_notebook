export function toCents(value) {
  return Number(String(value).replace(".", ""));
}

export function fromCents(cents) {
  return cents / 100;
}