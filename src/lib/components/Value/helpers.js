import { humanFileSize } from '../../shared/utils';
import TYPES from './types';
import HTML from '../HTML.svelte';

const RE_PLACEHOLDER = /\{(?:(@?[^{}|?!:@]*)(?::([\w*,.]+))?([|?!:])?(.*?)|)\}/;
const RE_IDENTITY = /\{\}/g;

export function getProp(result, from, key) {
  if (!key) return null;

  if (key.charAt() === '.') {
    if (key === '..') return result;
    return getProp(null, result, key.substr(1));
  }

  if (key === 'this') {
    if (!Array.isArray(from)) return from[key];
    return from;
  }

  if (Array.isArray(from)) {
    return getProp(result, { from }, `from.${key}`);
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
          return o.reduce((prev, y) => {
            const next = keys.slice(i + 1).join('.');

            if (next === '*') {
              return prev.concat(y);
            }

            const sub = getProp(result, y, next);

            if (typeof sub !== 'undefined') {
              prev.push(sub);
            }

            return prev;
          }, []);
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

export function renderValue(it, data, template) {
  if (Object.prototype.toString.call(template) === '[object Object]') {
    return Object.keys(template).reduce((prev, cur) => {
      prev[cur] = renderValue(it, data, template[cur]);

      if (Array.isArray(prev[cur])) {
        prev[cur] = prev[cur].join('');
      }

      return prev;
    }, {});
  }

  if (typeof template === 'string') {
    if (typeof data !== 'object') {
      return renderValue(it, { this: data }, template.replace(RE_IDENTITY, data));
    }

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
          value: matches[4].trim(),
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

    return result.filter(x => x).reduce((prev, cur) => {
      if (typeof cur === 'string') {
        prev.push(cur);
      } else {
        let retval;

        if (cur.expression.charAt() === '@' && cur.expression.length > 1) {
          try {
            const method = cur.expression.substr(1);

            if (typeof TYPES[method] !== 'function') {
              throw new Error(`Unknown helper ${method}`);
            }

            retval = TYPES[method](data,
              cur.property.reduce((memo, x) => memo.concat(getProp(it, data, x) || cur.value), []), document.body);
          } catch (e) {
            prev.push(`Error: ${e.message} in ${JSON.stringify(cur)}`);
          }
        } else {
          retval = typeof data === 'object' ? getProp(it, data, cur.expression) : data;
        }

        if (typeof retval === 'undefined' && cur.operator === '|') {
          retval = typeof data === 'object' ? getProp(it, data, cur.value) : cur.value;
        } else if (!retval && cur.operator === '!') {
          prev.push(cur.value);

          return prev;
        }

        if (typeof retval !== 'undefined' && retval !== null) {
          if (cur.operator === '?') {
            retval = cur.value;
          }

          if (typeof retval === 'object' && !Array.isArray(retval)) {
            retval = JSON.stringify(retval);
          }

          if (Array.isArray(retval)) {
            prev.push(...retval);
          } else {
            prev.push(retval);
          }
        }
      }

      return prev;
    }, []);
  }

  return template;
}

export function renderProps(it, value, object) {
  return Object.keys(object).reduce((memo, key) => {
    if (typeof object[key] === 'string') {
      memo[key] = renderValue(it, value, object[key]).join('');
    } else {
      memo[key] = object[key];
    }
    return memo;
  }, {});
}

export function reduce(it, value, template) {
  if (typeof template === 'string') {
    return renderValue(it, value, template);
  }

  if (!Array.isArray(template)) {
    return ['small.invalid', null, `Invalid template, given ${JSON.stringify(template)}`];
  }

  if (!Array.isArray(template[2])) {
    return [template[0], renderProps(it, value, template[1] || {}), template.slice(2).map(x => reduce(it, value, x))];
  }

  return [template[0], renderValue(it, value, template[1] || {}), template[2].map(x => reduce(it, value, x))];
}

export function renderDOM(it, value, template) {
  return [{
    component: HTML.default || HTML,
    options: {
      vnode: [].concat(template).map(x => reduce(it, value, x)),
    },
  }];
}

export function formatValue(value, formatter) {
  if (formatter === 'bytes') return humanFileSize(value);
  if (formatter === 'date') return new Date(value).toISOString().substr(0, 10);
  return value;
}
