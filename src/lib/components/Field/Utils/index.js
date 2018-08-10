
import ErrorType from './Error.svelte';
import LoaderType from './Loader.svelte';

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

export default {
  ErrorType,
  LoaderType,
};
