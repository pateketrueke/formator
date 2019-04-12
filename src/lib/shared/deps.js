export const BASE_URL = document.currentScript.src.replace('/main.js', '');

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
  if (typeof window.Ajv === 'undefined') {
    await import(`${BASE_URL}/ajv.js`);
  }
}

export default {
  getTypes,
  getAjv,
};
