export function randId() {
  return `_${Math.random().toString(36).substr(2)}`;
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
    copy[prop] = reduceRefs(schema[prop], refs);
  });

  return copy;
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
      target.className = data.className || 'json-schema-formalizer';

      node.parentNode.insertBefore(target, node);
      node.parentNode.removeChild(node);
    } else {
      target = node;
    }

    const Component = data.action === 'index'
      ? components.Table
      : components.Form;

    const instance = new Component({
      target,
      data,
    });

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
  call(action, data) {
    const url = `http://localhost:8081${action.path}`;

    return fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      method: action.verb,
      body: action.verb !== 'GET'
        ? JSON.stringify({ payload: data })
        : undefined,
    }).then(resp => resp.json());
  },
};

export default {
  reduceRefs,
  findRef,
  randId,
  loader,
  clean,
  API,
};
