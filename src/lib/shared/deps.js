export async function getTypes() {
  const deps = {
    string: import('../components/Field/Types/String'),
    number: import('../components/Field/Types/Number'),
    boolean: import('../components/Field/Types/Boolean'),
    array: import('../components/Field/Types/Array'),
    object: import('../components/Field/Types/Object'),
  };

  await Object.keys(deps).reduce((prev, cur) => prev.then(() => deps[cur])
    .then(({ default: defaultValue }) => { deps[cur] = defaultValue; }), Promise.resolve());

  deps.integer = deps.number;

  return deps;
}

export async function getAjv() {
  await import('//unpkg.com/ajv@6.5.4/dist/ajv.bundle.js');
}

export default {
  getTypes,
  getAjv,
};
