export default async function getTypes() {
  const { default: string } = await import('./String');
  const { default: number } = await import('./Number');
  const { default: boolean } = await import('./Boolean');
  const { default: array } = await import('./Array');
  const { default: object } = await import('./Object');

  return {
    integer: number,
    number,
    string,
    boolean,
    array,
    object,
  };
}
