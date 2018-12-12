import { $ } from './widgets';
import TYPES from './types';
import HTML from '../HTML';

const RE_PLACEHOLDER = /\{(?:(@?[\w.]+)(?::([\w*,.]+))?([|?!])?(.*?)|)\}/;
const RE_IDENTITY = /\{\}/g;

export function getProp(from, key) {
  if (!key) {
    return null;
  }

  if (Array.isArray(from)) {
    return getProp({ from }, `from.${key}`);
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
          return o.map(y => getProp(y, keys.slice(i + 1).join('.')));
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
  if (typeof data !== 'object') {
    return template.replace(RE_IDENTITY, data);
  }

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

    return result.filter(x => x).reduce((prev, cur) => {
      if (typeof cur === 'string') {
        prev.push(cur);
      } else {
        let retval;

        if (cur.expression.charAt() === '@') {
          try {
            const method = cur.expression.substr(1);

            if (typeof TYPES[method] !== 'function') {
              throw new Error(`Unknown helper ${method}`);
            }

            retval = TYPES[method](data,
              cur.property.map(x => getProp(data, x) || cur.value), document.body);
          } catch (e) {
            prev.push(`Error in expression: ${JSON.stringify(cur)} (${e.message})`);
          }
        } else {
          retval = getProp(data, cur.expression);
        }

        if (typeof retval === 'undefined' && cur.operator === '|') {
          retval = getProp(data, cur.value);
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

          prev.push(retval);
        }
      }

      return prev;
    }, []);
  }

  return template;
}

export function reduce(value, template) {
  if (Array.isArray(template[1])) {
    return [template[0], null, template[1].map(x => reduce(value, x))];
  }

  if (Array.isArray(template[2])) {
    return [template[0], template[1], template[2].map(x => reduce(value, x))];
  }

  const text = template[template.length - 1];

  if (typeof text === 'string' && RE_PLACEHOLDER.test(text)) {
    return [template[0], template[2] ? template[1] : null, renderValue(value, text)];
  }

  return template;
}

export function renderDOM(value, template) {
  return [{
    component: HTML,
    options: {
      element: $(reduce(value, template)),
    },
  }];
}
