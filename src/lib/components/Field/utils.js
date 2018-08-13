import RefType from './Ref.svelte';
import ErrorType from './Error.svelte';
import LoaderType from './Loader.svelte';

const VALUES = {
  object: () => ({}),
  array: () => [],
  string: () => '',
  integer: () => null,
  number: () => null,
  boolean: () => false,
};

const INDEX = {};

export function getId(rootId, forName, isLabel) {
  if (!INDEX[forName]) {
    INDEX[forName] = 0;
  }

  if (isLabel) {
    INDEX[forName] += 1;
  }

  const offset = INDEX[forName];
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

  return VALUES[schema.type || 'object']();
}

export default {
  getId,
  RefType,
  ErrorType,
  LoaderType,
  defaultValue,
};
