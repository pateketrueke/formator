import { getItems, defaultValue } from '../../utils';
import { randId } from '../../../../shared/utils';

export default {
  components: {
    Field: '../../Field',
    Value: '../../Value',
    Modal: '../../../Modal',
  },
  data() {
    return {
      keys: [],
      result: null,
    };
  },
  oncreate() {
    const { values, schema } = this.get();

    if (schema && Array.isArray(schema.items)) {
      const keys = [];
      const result = [];

      schema.items.forEach((props, offset) => {
        keys.push(randId());
        result.push(values[offset] || defaultValue(props));
      });

      this.set({ result, keys });
    }
  },
  methods: {
    append() {
      const { nextOffset, schema } = this.get();

      this.add(defaultValue(getItems(schema, nextOffset)));
    },
    remove(offset) {
      const { result, keys } = this.get();

      result.splice(offset, 1);
      keys.splice(offset, 1);

      this.set({ result, keys });
    },
    open() {
      const { schema, nextOffset } = this.get();

      this.set({
        isOpen: true,
        nextValue: defaultValue(getItems(schema, nextOffset)),
      });
    },
    sync() {
      const { result, nextValue, currentOffset } = this.get();

      if (typeof currentOffset === 'undefined') {
        this.add(nextValue);
      } else {
        result[currentOffset] = nextValue;

        this.set({
          currentOffset: undefined,
          result,
        });
      }

      this.fire('sync');
    },
    edit(offset) {
      const { values } = this.get();

      this.set({
        isOpen: true,
        currentOffset: offset,
        nextValue: values[offset],
      });
    },
    add(value) {
      const { result, keys } = this.get();

      const key = randId();

      if (!result) {
        this.set({
          keys: [key],
          result: [value],
        });
      } else {
        this.set({
          keys: keys.concat(key),
          result: result.concat(Array.isArray(value) ? [value] : value),
        });
      }
    },
  },
  computed: {
    fixedSchema({ isFixed, uiSchema }) {
      if (!uiSchema) {
        return isFixed ? [] : {};
      }

      return uiSchema;
    },
    nextOffset({ result, currentOffset }) {
      if (typeof currentOffset === 'undefined') {
        return result ? result.length : 0;
      }

      return currentOffset;
    },
    nextProps({
      fixedSchema, isFixed, path, schema, nextOffset,
    }) {
      return {
        path: (path || []).concat(nextOffset),
        props: getItems(schema, nextOffset),
        uiSchema: isFixed ? fixedSchema[nextOffset] || {} : fixedSchema,
      };
    },
    isUpdate({ currentOffset }) {
      return typeof currentOffset !== 'undefined';
    },
    isFixed({ schema }) {
      return Array.isArray(schema.items);
    },
    headers({ fixedSchema, schema }) {
      const propSchema = getItems(schema, 0);
      const props = propSchema.properties
        ? Object.keys(propSchema.properties)
        : [];

      return props.map((key, offset) => ({
        label: (fixedSchema['ui:headers'] && fixedSchema['ui:headers'][offset]) || key,
        field: key,
      }));
    },
    values({ result }) {
      return result || [];
    },
    items({
      fixedSchema, isFixed, path, schema, values, keys,
    }) {
      return values.map((_, offset) => {
        const props = getItems(schema, offset);
        const key = keys[offset] || (keys[offset] = randId());

        return {
          key,
          props,
          offset,
          path: (path || []).concat(offset),
          isFixed: isFixed && offset < schema.items.length,
          uiSchema: isFixed ? fixedSchema[offset] || {} : fixedSchema,
        };
      });
    },
  },
};
