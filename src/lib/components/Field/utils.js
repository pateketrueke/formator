import LinkType from './Link';
import ErrorType from './Error';
import LoaderType from './Loader';

import { destroy, update } from '../Modal/stacked';

const RE_PLACEHOLDER = /\{(?:(@?[\w.]+)(?::([\w*,.]+))?([|?!])?(.*?))\}/;
const RE_DATA_BASE64 = /^data:(.+?);base64,/;

const OTHER_TYPES = {
  media(data, values, parentNode) {
    let fileName;

    if (!values.length) {
      return 'NOIMG';
    }

    if (values[0].indexOf('data:') > -1) {
      fileName = values[0].match(RE_DATA_BASE64)[1].split(';')[1].split('name=')[1];
    } else {
      fileName = values[0];
    }

    if (values[1]) {
      fileName = values[1];
    }

    return {
      component: LinkType,
      options: {
        text: fileName || values[0],
        href: values[0],
      },
      onClick(e) {
        if (e.metaKey || e.ctrlKey) {
          return;
        }

        e.preventDefault();

        const target = document.createElement('div');

        parentNode.appendChild(target);

        // FIXME: reuse [data-modal] or viceversa?
        target.setAttribute('data-title', fileName || values[0]);
        target.classList.add('json-schema-formalizer-layer');
        target.classList.add('overlay');

        function closeMe(el) {
          if (el && (el.target !== target)) {
            return;
          }

          destroy(closeMe);
          parentNode.removeChild(target);
        }

        target.addEventListener('click', closeMe);
        closeMe.close = closeMe;
        update(closeMe, true);

        setTimeout(() => {
          target.classList.add('active');

          setTimeout(() => {
            const display = !values[0].match(/\.(svg|gif|png|jpe?g)$/)
              ? document.createElement('iframe')
              : document.createElement('img');

            if (display.tagName === 'IFRAME') {
              display.setAttribute('width', 853);
              display.setAttribute('height', 505);
            }

            display.style.opacity = 0;
            display.src = values[0];

            target.appendChild(display);

            setTimeout(() => {
              display.style.opacity = 1;
            }, 100);
          }, 100);
        });
      },
    };
  },
  sum(data, values) {
    return values.map(x => x.reduce((prev, cur) => prev + cur, 0).toFixed(2).replace('.00', '')).join(', ');
  },
  mul(data, values) {
    const isMixed = Array.isArray(values[0]);
    const length = isMixed ? values[0].length : 1;

    if (isMixed) {
      values = values.map(x => x.map(Number).reduce((prev, cur) => prev + cur, 0));
    }

    return (values.reduce((prev, cur) => {
      if (cur !== 0 && cur !== Infinity) {
        prev *= cur;
      }
      return prev || cur;
    }, 0) / length).toFixed(2).replace('.00', '');
  },
  uniq(data, values) {
    return (this.value(data, values) || [])
      .reduce((prev, cur) => {
        if (prev.indexOf(cur) === -1) {
          prev.push(cur);
        }
        return prev;
      }, []).join(', ');
  },
  value(data, values) {
    return values.filter(Boolean)[0] || null;
  },
};

const VALUES = {
  object: () => ({}),
  array: () => [],
  string: () => '',
  integer: () => undefined,
  number: () => undefined,
  boolean: () => false,
};

const INDEX = {};

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

    return result.filter(x => x).reduce((prev, cur) => {
      if (typeof cur === 'string') {
        prev.push(cur);
      } else {
        let retval;

        if (cur.expression.charAt() === '@') {
          try {
            retval = OTHER_TYPES[cur.expression.substr(1)](data,
              cur.property.map(x => getProperty(data, x) || cur.value), document.body);
          } catch (e) {
            prev.push(`Error in expression: ${JSON.stringify(cur)} (${e.message})`);
          }
        } else {
          retval = getProperty(data, cur.expression);
        }

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

          if (typeof retval === 'object' && typeof retval.component !== 'function') {
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
