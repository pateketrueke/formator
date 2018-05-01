import {
  RE_PLACEHOLDER,
  RE_DATA_BASE64,
  HEADERS,
  TYPES } from './constants';

export function getProp(from, key) {
  if (!key) {
    return null;
  }

  const keys = key.split('.');

  let o = from;
  let k;

  try {
    for (let i = 0;;) {
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
      i++;
    }
  } catch (e) {
    return null;
  }

  return o;
}

export function ifDef() {
  const args = Array.prototype.slice.call(arguments);

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] !== null && typeof args[i] !== 'undefined') {
      return args[i];
    }
  }
}

export function getText(value) {
  if (Array.isArray(value)) {
    return value.map(getText);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value).map(key => getText(value[key])).join('\n');
  }

  return value;
}

export function fixResource(context) {
  // normalize context
  context.action = context.action || (context.isNew ? 'new' : '');
  context.result = context.result || {};
  context.model = context.model || 'Object';
  context.refs = context.refs || {};

  context.schema = context.schema || {};
  context.schema.id = context.schema.id || context.model;
  context.schema.type = context.schema.type || 'object';
  context.schema.properties = context.schema.properties || {};

  context.uiSchema = context.uiSchema || {};
  context.actions = context.actions || {};
}

export function fixReferences(value, through, source) {
  if (Array.isArray(value)) {
    return value.map(x => fixReferences(x, through, source));
  }

  if (typeof value === 'string') {
    value = value.replace(/\{(\w+)(.*?)\}/g, ($0, pre, val) => {
      if (pre === through) {
        return `{${val.substr(1)}}`;
      }

      return `{${source}.${pre}${val}}`;
    });
  }

  return value;
}

export function fixPayload(options, refs, payload, keepReferences) {
  const data = merge({}, payload);

  // FIXME: all this is outdated...
  Object.keys(options.refs).forEach(prop => {
    if (options.refs[prop].references) {
      const pk = options.refs[prop].references.primaryKeys[0];

      if (data[prop] && typeof data[prop][pk.prop] !== 'undefined') {
        data[options.refs[prop].model] = data[prop];
        data[prop] = data[prop][pk.prop];
      }

      if (!keepReferences && options.refs[prop]) {
        delete data[options.refs[prop].model];
      }
    }
  });

  if (refs.foreignKeys) {
    refs.foreignKeys.forEach(fk => {
      if (typeof data[fk.prop] == 'object') {
        data[fk.prop] = undefined;
      }
    });
  }

  if (keepReferences) {
    Object.defineProperty(data, '_new', {
      value: true,
      enumerable: false,
    });
  }

  return data;
}

export function linkTo(url, params) {
  if (params) {
    Object.keys(params).forEach(prop => {
      url = url.replace(`:${prop}`, params[prop]);
    });
  }

  if (location.search) {
    const q = location.search.split('?')[1];

    return `${url}${url.indexOf('?') === -1 ? '?' : '&'}${q}`;
  }

  return url;
}

export function merge(target) {
  Array.prototype.slice.call(arguments, 1).forEach(source => {
    if (source) {
      Object.keys(source).forEach(key => {
        if (typeof target[key] === 'undefined') {
          target[key] = source[key];
        }
      });
    }
  });

  return target;
}

// FIXME: there is a standard way?
export function paramify(obj) {
  const out = [];

  Object.keys(obj).forEach(k => {
    if (typeof obj[k] === 'object') {
      out.push(`${k}:${paramify(obj[k])}`);
    } else {
      out.push(`${k}:${obj[k]}`);
    }
  });

  return out.join(';');
}

export function fetchCall(url, options) {
  console.log(options.method || 'GET', url, options.body);

  return fetch(url, options);
}

export function getJSON(payload, query) {
  const q = [];

  if (query) {
    Object.keys(query).forEach(prop => {
      q.push((q.length ? '&' : '?'));

      if (typeof query[prop] === 'object') {
        q.push(`${prop}=${paramify(query[prop])}`);
      } else {
        q.push(`${prop}=${query[prop]}`);
      }
    });
  }

  return fetchCall(`${payload.path}${q.join('')}`, {
    credentials: 'same-origin',
    headers: HEADERS,
  })
  .then(resp => resp.json());
}

export function fixData(options) {
  options.result = options.result || {};

  Object.keys(options.schema.properties).forEach(prop => {
    const field = options.schema.properties[prop];

    if (options.result[prop] === null) {
      delete options.result[prop];
    }

    if (field.$ref && options.isNew) {
      options.result[prop] = undefined;
    }
  });

  return options.result;
}

// FIXME: add proper replace for :params

export function postJSON(payload, formData, param, prop) {
  return fetchCall(linkTo(payload.path.replace(param, formData[prop])), {
    credentials: 'same-origin',
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      payload: formData,
      _method: payload.verb,
    }),
  })
  .then(resp => resp.json());
}

export function buildSchema(options) {
  Object.keys(options.schema.properties).forEach(prop => {
    const value = options.schema.properties[prop];
    const ref = (value.items || value).$ref;

    if (ref) {
      options.schema.properties[prop] = {
        ref: options.refs[ref],
        prop,
      };

      // FIXME: adjust these schemas properly, separate state from data!
      if (value.type === 'array' || prop === 'items') {
        options.schema.properties[prop].type = 'array';
      }
    }
  });

  return options.schema;
}

export function buildUISchema(options) {
  const ref = options.refs[options.model || options.schema.id] || {};

  options.uiSchema['ui:rootFieldId'] = ref.singular || 'Object';

  Object.keys(options.schema.properties).forEach(prop => {
    if (options.schema.properties[prop].ref) {
      const id = options.schema.properties[prop].ref.id;

      options.uiSchema[prop] = merge({}, options.uiSchema[prop], options.refs[id].uiSchema);
      options.uiSchema[prop]['ui:field'] = 'Reference';
    }

    // FIXME: use a generic strategy here (date, time, etc.)
    if (options.schema.properties[prop].format === 'datetime' || options.schema.properties[prop].format === 'date-time') {
      options.uiSchema[prop] = options.uiSchema[prop] || {};
      options.uiSchema[prop]['ui:field'] = 'Datetime';
    }
  });

  return options.uiSchema;
}

export function getProperty(data, template, parentNode) {
  if (Array.isArray(template)) {
    return renderFromAST(template, data, parentNode);
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

    return result.filter(x => x).reduce((prev, cur, i) => {
      if (typeof cur === 'string') {
        prev.push(cur)
      } else {
        let retval;

        if (cur.expression.charAt() === '@') {
          const values = cur.property
            .map(x => getProp(data, x) || cur.value);

          try {
            retval = TYPES[cur.expression.substr(1)](data, values, parentNode);
          } catch (e) {
            prev.push(<div key={`err_${i}`}>Error in expression:<pre>{JSON.stringify(cur, null, 2)}</pre></div>);
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

          if (typeof retval === 'object' && !React.isValidElement(retval)) {
            retval = <pre key={`obj_${i}`}>{JSON.stringify(retval, null, 2)}</pre>;
          }

          prev.push(retval);
        }
      }

      return prev;
    }, []);
  }

  return template;
}

export function renderFromAST(ast, data, parentNode, parentGroup) {
  if (Array.isArray(ast)) {
    if (typeof ast[0] === 'string') {
      const tag = ast[0];

      let attrs = typeof ast[1] === 'object' && !Array.isArray(ast[1])
        ? ast[1]
        : null;

      if (attrs) {
        Object.keys(attrs).forEach(key => {
          attrs[key] = getProperty(data, attrs[key], parentNode);
        });
      }

      const children = renderFromAST(ast[2] || ast[1], data, parentNode)

      if (parentGroup) {
        attrs = attrs || {};
        attrs.key = attrs.key || parentGroup;
      }

      if (tag === 'input') {
        return React.createElement(tag, attrs);
      }

      return React.createElement(tag, attrs, children.map(x => getProperty(data, x, parentNode)));
    }

    if (Array.isArray(ast[0])) {
      return ast.map((x, k) => renderFromAST(x, data, parentNode, k + 1));
    }
  }

  if (typeof ast === 'string' || typeof ast === 'number' || typeof ast === 'boolean') {
    return getProperty(data, ast, parentNode);
  }

  return <div>
    <span>Invalid template syntax</span>
    <pre>{JSON.stringify(ast, null, 2)}</pre>
  </div>;
}
