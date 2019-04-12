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

export default {
  getTypes,
};
