export default async function getTypes() {
  const { default: string } = await import('./String.svelte');
  const { default: number } = await import('./Number.svelte');
  const { default: boolean } = await import('./Boolean.svelte');
  const { default: array } = await import('./Array.svelte');
  const { default: object } = await import('./Object.svelte');

  return {
    integer: number,
    number,
    string,
    boolean,
    array,
    object,
  };
}
