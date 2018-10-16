import ErrorType from './Error.svelte';
import LoaderType from './Loader.svelte';

const VALUES = {
  object: () => ({}),
  array: () => [],
  string: () => '',
  integer: () => undefined,
  number: () => undefined,
  boolean: () => false,
};

const INDEX = {};

const RE_PLACEHOLDER = /\{(?:([\w.]+)(?::([\w*,.]+))?([|?!])?(.*?))\}/;

export function getProperty(from, key) {
  if (!key) {
    return null;
  }

  const keys = key.split('.');

  let o = from;
  let k;

  try {
    for (let i = 0; ;) {
      if (!keys.length) {
        break;
      }

      k = keys.shift();
      o = o[k];

      if (Array.isArray(o)) {
        if (keys[i] === '*') {
          return o.map(y => getProperty(y, keys.slice(i + 1).join('.')));
        }
        o = o[0];
      }

      i += 1;
    }
  } catch (e) {
    return null;
  }

  return o;
}

export function renderValue(data, template) {
  if (typeof template === 'string') {
    let copy = template;
    let matches;

    const values = [];

    do {
      matches = copy.match(RE_PLACEHOLDER);

      if (matches) {
        values.push({
          expression: matches[1],
          property: (matches[2] || '')
            .split(',')
            .filter(x => x),
          operator: matches[3],
          value: matches[4],
        });

        copy = copy.replace(matches[0], '\0');
      }
    } while (matches);

    const parts = copy.split('\0');
    const result = [];

    while (values.length || parts.length) {
      result.push(parts.shift());
      result.push(values.shift());
    }

    return result.filter(x => x).reduce((prev, cur, i) => {
      if (typeof cur === 'string') {
        prev.push(cur);
      } else {
        let retval = getProperty(data, cur.expression);

        if (typeof retval === 'undefined' && cur.operator === '|') {
          retval = getProperty(data, cur.value);
        } else if (!retval && cur.operator === '!') {
          prev.push(cur.value);

          return prev;
        }

        if (typeof retval !== 'undefined' && retval !== null) {
          if (cur.operator === '?') {
            retval = cur.value;
          }

          if (typeof retval === 'object') {
            retval = JSON.stringify(retval);
          }

          prev.push(retval);
        }
      }

      return prev;
    }, []);
  }

  return template;
}

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
  ErrorType,
  LoaderType,
  defaultValue,
};
