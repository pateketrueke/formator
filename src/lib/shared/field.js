function get(promise) {
  return promise.then(x => x.default);
}

// FIXME: move all lazy deps this way...
export default function getField() {
  return get(import('../components/Field/Field.svelte'));
}
