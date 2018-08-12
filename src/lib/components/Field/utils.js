import ErrorType from './Error.svelte';
import LoaderType from './Loader.svelte';

const VALUES = {
  object: () => ({}),
  array: () => [],
  string: () => '',
  integer: () => 0.0,
  number: () => 0,
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

  return `${rootId}-${forName}-field-${offset}`;
}

export function randId() {
  return `_${Math.random().toString(36).substr(2, 9)}`;
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
  randId,
  ErrorType,
  LoaderType,
  defaultValue,
};
