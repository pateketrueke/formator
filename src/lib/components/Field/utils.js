const DEFAULT_VALUES = {
  object: () => ({}),
  array: () => [],
  string: () => '',
  integer: () => 0,
  number: () => 0.0,
  boolean: () => false,
};

const INDEX = {};

export function sync() {
  const {
    path, name, association,
  } = this.get();

  const {
    refs,
  } = this.root.get();

  if (!path || path.length === 1) {
    this.on('update', ({ changed }) => {
      if (changed.result) {
        this.fire('sync');
      }
    });
  }

  this.set({
    association: refs[name] || association || {},
  });

  if (typeof this.load === 'function') {
    this.load();
  }
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

export function getItems(schema, offset) {
  return (Array.isArray(schema.items)
    ? schema.items[offset]
    : schema.items)
  || schema.additionalItems
  || {};
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

export default {
  sync,
  getId,
  getItems,
  defaultValue,
};
