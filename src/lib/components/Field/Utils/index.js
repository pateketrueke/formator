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

export function getId(forName, isLabel) {
  if (!INDEX[forName]) {
    INDEX[forName] = 0;
  }

  if (isLabel) {
    INDEX[forName] += 1;
  }

  const offset = INDEX[forName];

  return `${forName}-field-${offset}`;
}

export function defaultValue(schema, refs) {
  let type = schema.type || 'object';

  if (schema.$ref && refs[schema.$ref]) {
    type = refs[schema.$ref].type || type;
  }

  return VALUES[type]();
}

export default {
  ErrorType,
  LoaderType,
  defaultValue,
};
