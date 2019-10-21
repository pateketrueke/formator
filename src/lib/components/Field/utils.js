const DEFAULT_VALUES = {
  object: () => ({}),
  array: () => [],
  string: () => '',
  integer: () => 0,
  number: () => 0.0,
  boolean: () => false,
};

const SHARED_INDEX = {};

export function getId(rootId, forName, incOffset) {
  if (!SHARED_INDEX[forName]) {
    SHARED_INDEX[forName] = 0;
  }

  if (incOffset) {
    SHARED_INDEX[forName] += 1;
  }

  const offset = SHARED_INDEX[forName];
  const prefix = rootId ? `${rootId}-` : '';

  return `${prefix}${forName}-field-${offset}`;
}

export function defaultValue(schema) {
  if (!schema) {
    return null;
  }

  if (schema.properties) {
    return Object.keys(schema.properties).reduce((prev, cur) => {
      prev[cur] = defaultValue(schema.properties[cur]);

      return prev;
    }, {});
  }

  return DEFAULT_VALUES[schema.type || 'object']();
}
