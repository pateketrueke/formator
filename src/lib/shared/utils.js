const DEFAULT_VALUES = {
  object: () => ({}),
  array: () => [],
  string: () => '',
  integer: () => 0,
  number: () => 0.0,
  boolean: () => false,
};

const SHARED_INDEX = {};
const USED_COLS = [null, 'lg', 'xl', 'wl'];

export function getId(rootId, forName, incOffset) {
  if (!SHARED_INDEX[forName]) {
    SHARED_INDEX[forName] = 0;
  }

  if (incOffset) {
    SHARED_INDEX[forName] += 1;
  }

  const offset = SHARED_INDEX[forName];
  const prefix = rootId ? `${rootId}-` : '';

  return `${prefix}${forName}-field-${offset}`;
}

export function getCols(value) {
  if (!value) return [];

  const parts = value.split(':');
  const classes = [];

  for (let i = 0; i < parts.length; i += 1) {
    if (!parts[i]) continue; // eslint-disable-line

    const width = parts[i].replace(/\?$/, '');
    const prefix = USED_COLS[i] ? `${USED_COLS[i]}-` : '';

    if (prefix && parts[i].includes('?')) {
      classes.push(`${prefix}show`);
    }
    if (width) {
      classes.push(`${prefix}col-${width}`);
    }
  }
  return classes;
}

export function fixedCols(_uiSchema, headers) {
  let classes = [];
  if (_uiSchema && _uiSchema['ui:class']) {
    classes = classes.concat(_uiSchema['ui:class']);
  }
  if (_uiSchema && _uiSchema['ui:columns']) {
    classes = classes.concat(getCols(_uiSchema['ui:columns']));
  }
  if (!classes.length) {
    classes.push(`col-${Math.floor(12 / (headers.length + 1))}`);
  }
  return classes.join(' ');
}

export function getItems(schema, offset) {
  return (Array.isArray(schema.items)
    ? schema.items[offset]
    : schema.items)
  || schema.additionalItems
  || null;
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

  return DEFAULT_VALUES[schema.type || 'object']();
}

export function humanFileSize(bytes, decimals = 1) {
  if (Math.abs(bytes) < 1000) return `${bytes} B`;

  const units = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const ratio = 10 ** decimals;

  let unit = -1;

  do {
    bytes /= 1000;
    unit += 1;
  } while (Math.round(Math.abs(bytes) * ratio) / ratio >= 1000 && unit < units.length - 1);

  return `${bytes.toFixed(decimals)} ${units[unit]}`;
}

export function jsonData(value, cb) {
  if (typeof value === 'string' && value.charAt() === '{' && value.charAt(value.length - 1) === '}') {
    try {
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  }

  if (value !== null && typeof value === 'object') {
    return value;
  }

  return cb();
}

export function showError(field, target) {
  const selector = `[data-field="${field}"]`;
  const el = target.querySelector(selector);

  if (el) {
    el.classList.add('invalid');
  }
}

export function throttle(fn, ms) {
  let t;
  return function $fn(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), ms || 100);
  };
}

export function randId(prefix) {
  return `${prefix || '_'}${Math.random().toString(36).substr(2)}`;
}

export function findRef(id, refs) {
  if (refs[id]) {
    return refs[id];
  }

  const [_id, path] = id.split('#/');

  let schema = refs[_id || id];

  if (!schema) {
    throw new Error(`Missing reference '${_id || id}'`);
  }

  const parts = path.split('/');

  while (parts.length) {
    schema = schema[parts.shift()];
  }

  if (schema.$ref) {
    return findRef(schema.$ref, refs);
  }

  return schema;
}

export function reduceRefs(schema, refs) {
  if (!schema || typeof schema !== 'object') {
    return schema;
  }

  if (Array.isArray(schema)) {
    return schema.map(x => reduceRefs(x, refs));
  }

  if (schema.$ref) {
    return reduceRefs(findRef(schema.$ref, refs), refs);
  }

  const copy = {};

  Object.keys(schema).forEach(prop => {
    if (prop !== 'definitions') {
      copy[prop] = reduceRefs(schema[prop], refs);
    }
  });

  return copy;
}

export function withKeys(values) {
  return values.map(x => ({
    key: x.key || randId('key_'),
    data: x,
  }));
}

export function isScalar(value) {
  return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

export function isEmpty(value) {
  if (typeof value === 'object') {
    return (Array.isArray(value) && value.length === 0)
      || (Object.keys(value).length === 0);
  }

  return (typeof value === 'undefined'
    || value === null
    || value === '');
}

export function loader(components, selector) {
  return [].slice.call(document.querySelectorAll(selector)).map(node => {
    let target;
    let data;

    try {
      data = JSON.parse(node.dataset.resource || node.innerText);
    } catch (e) {
      data = {};
    }

    if (node.tagName === 'SCRIPT') {
      target = document.createElement('div');
      target.className = data.className || 'formator';

      node.parentNode.insertBefore(target, node);
      node.parentNode.removeChild(node);
    } else {
      target = node;
    }

    // assume resource listing by default
    if (!data.model && Array.isArray(data.result)) {
      data = {
        result: data.result,
        schema: {
          type: 'array',
          items: { type: 'string' },
        },
        uiSchema: {
          'ui:template': [['a', { href: `${document.location.pathname.replace(/\/$/, '')}/{}` }, ['{}']]],
          'ui:title': data.description || 'Resources',
          'ui:push': false,
        },
      };
    }

    const Component = data.action === 'index'
      ? components.Table
      : components.Form;

    const instance = new Component({
      target,
      props: {
        ...data,
      },
    });

    let result;
    let debug;

    if (node.dataset.debug) {
      const el = document.querySelector(node.dataset.debug);

      if (el) {
        debug = el;
      }
    }

    instance.$on('change', e => {
      if (debug) {
        debug.innerText = JSON.stringify(e.detail, (_, v) => {
          if (v instanceof window.File) return `[File (${v.name})]`;
          if (typeof v === 'string' && v.indexOf('data:') === 0) return `${v.substr(0, 32)}...`;
          return v;
        }, 2);
      }

      result = e.detail;
    });

    // expose getter as only public API method
    target.get = () => result;

    return instance;
  });
}

export function clean(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(clean);
  }

  const copy = {};

  Object.keys(value).forEach(key => {
    if (value[key] !== null) {
      copy[key] = clean(value[key]);
    }
  });

  return copy;
}

export const API = {
  call(action, data = {}) {
    let path = action.path.replace(/:(\w+)/g, (_, key) => data[key]);

    const local = document.location.pathname.split('/');
    const parts = path.split('/');

    if (local.length > 3
      && local[0] === parts[0]
      && local[1] === parts[1]
      && local[2] !== parts[2]
    ) {
      parts.splice(2, 0, local[2]);
      path = parts.join('/');
    }

    const fixedHeaders = {
      Accept: 'application/json',
    };

    const formData = new FormData();

    let hasFiles;
    let payload;

    function walkProps(obj) {
      if (!obj || typeof obj !== 'object') return obj;
      Object.keys(obj).forEach(key => {
        if (Array.isArray(obj[key]) && obj[key][0] instanceof window.File) {
          const prefix = randId('upload_');

          obj[key].forEach(blob => {
            formData.append(prefix, blob);
          });
          obj[key] = { $upload: prefix };
          hasFiles = true;
        } else if (obj[key] instanceof window.File) {
          const prefix = randId('upload_');

          formData.append(prefix, obj[key]);
          obj[key] = { $upload: prefix };
          hasFiles = true;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          if (!Object.keys(obj[key]).length) delete obj[key];
          else walkProps(obj[key]);
        }
      });
    }

    if (data instanceof window.File) {
      const prefix = randId('upload_');

      formData.append(prefix, data);
      data = { $upload: prefix };
      hasFiles = true;
    } else {
      walkProps(data);
    }

    if (hasFiles) {
      formData.append('payload', JSON.stringify(data));
      payload = formData;
    } else {
      fixedHeaders['Content-Type'] = 'application/json';
      payload = JSON.stringify({ payload: data });
    }

    return fetch(path, {
      headers: fixedHeaders,
      method: action.verb,
      body: action.verb !== 'GET' ? payload : undefined,
    }).then(resp => resp.json());
  },
};
