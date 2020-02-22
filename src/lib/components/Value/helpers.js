import { $ } from './widgets';
import TYPES from './types';
import HTML from '../HTML';

const RE_PLACEHOLDER = /\{(?:(@?[^{}|?!:@]*)(?::([\w*,.]+))?([|?!:])?(.*?)|)\}/;
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
          return o.reduce((prev, y) => {
            const sub = getProp(y, keys.slice(i + 1).join('.'));

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

export function renderValue(data, template) {
  if (typeof template === 'object') {
    return Object.keys(template).reduce((prev, cur) => {
      prev[cur] = renderValue(data, template[cur]);

      return prev;
    }, {});
  }

  if (typeof template === 'string') {
    if (typeof data !== 'object') {
      return template.replace(RE_IDENTITY, data);
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
              cur.property.map(x => getProp(data, x) || cur.value, []), document.body);
          } catch (e) {
            prev.push(`Error: ${e.message} in ${JSON.stringify(cur)}`);
          }
        } else {
          retval = typeof data === 'object' ? getProp(data, cur.expression) : data;
        }

        if (typeof retval === 'undefined' && cur.operator === '|') {
          retval = typeof data === 'object' ? getProp(data, cur.value) : cur.value;
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
  if (!Array.isArray(template)) {
    return ['small.invalid', null, `Invalid template, given ${JSON.stringify(template)}`];
  }

  if (Array.isArray(template[1])) {
    return [template[0], null, template[1].map(x => reduce(value, x))];
  }

  if (Array.isArray(template[2])) {
    return [template[0], template[1], template[2].map(x => reduce(value, x))];
  }

  const offset = Math.min(2, template.findIndex((x, i) => i !== 0 && typeof x === 'string'));

  const text = template.slice(offset);
  const node = template.slice(0, offset);

  return [node[0], node[1] ? renderValue(value, node[1]) : null].concat(text.map(x => renderValue(value, x)));
}

export function renderDOM(value, template) {
  return [{
    component: HTML,
    options: {
      children: template.map(x => $(reduce(value, x))),
    },
  }];
}
