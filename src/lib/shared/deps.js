export async function getTypes() {
  const deps = {
    string: import('../components/Field/Types/String'),
    number: import('../components/Field/Types/Number'),
    boolean: import('../components/Field/Types/Boolean'),
    array: import('../components/Field/Types/Array'),
    object: import('../components/Field/Types/Object'),
  };

  await Promise.all(Object.keys(deps).map(x =>
    deps[x].then(({ default: defaultValue }) => {
      deps[x] = defaultValue;
    })));

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
