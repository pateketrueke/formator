import { getItems, defaultValue } from '../../utils';
import { API, randId } from '../../../../shared/utils';

export default {
  components: {
    Field: '../../Field',
    Value: '../../../Value',
    Modal: '../../../Modal',
  },
  data() {
    return {
      keys: [],
      result: null,
    };
  },
  oncreate() {
    const { values, schema, name } = this.get();
    const { actions, refs } = this.root.get();

    // FIXME: make a helper of this, also retrieve model from refs[name] is the right path!
    const ref = refs[name];
    const pk = ref && ref.references && ref.references.primaryKeys[0].prop;

    this.set({
      actions: actions[ref.through || ref.model],
      ref,
      pk,
    });

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
    splice(offset) {
      const {
        result, keys,
      } = this.get();

      result.splice(offset, 1);
      keys.splice(offset, 1);

      this.set({ result, keys });
      this.fire('sync');
    },
    remove(offset) {
      const {
        result, actions, pk,
      } = this.get();

      // FIXME: generalize these methods, reuse then?
      if (actions && result[offset][pk]) {
        API.call(actions.destroy, result[offset]).then(data => {
          if (data.status === 'ok') {
            this.splice(offset);
          }
        });
      } else {
        this.splice(offset);
      }
    },
    open() {
      const { schema, nextOffset } = this.get();

      this.set({
        isOpen: true,
        nextValue: defaultValue(getItems(schema, nextOffset)),
      });
    },
    reset() {
      this.set({
        currentOffset: undefined,
      });
    },
    update(offset, value) {
      const {
        values,
      } = this.get();

      // FIXME: current result is not being reflected on the UI
      values[offset] = {};
      this.set({ currentOffset: undefined, result: values.slice() });

      values[offset] = value;
      this.set({ result: values.slice() });
      this.fire('sync');
    },
    sync() {
      const {
        nextValue, currentOffset, actions, pk,
      } = this.get();

      if (typeof currentOffset === 'undefined') {
        this.add(nextValue);
      } else if (nextValue[pk] && actions) {
        API.call(actions.update, nextValue)
          .then(data => {
            if (data.status === 'ok') {
              this.update(currentOffset, nextValue);
            }
          });
      } else {
        this.update(currentOffset, nextValue);
      }
    },
    edit(offset) {
      const { values } = this.get();

      this.set({
        isOpen: true,
        currentOffset: offset,
        nextValue: values[offset],
      });
    },
    push(key, value) {
      const { result, keys } = this.get();

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
    add(value) {
      const {
        actions, parent, pk,
      } = this.get();

      const key = randId();

      if (actions && Object.values(parent).filter(Boolean).length > 0) {
        API.call(actions.create, value)
          .then(data => {
            if (data.status === 'ok') {
              this.push(key, value);
            }
          });
      } else {
        this.push(key, value);
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
      fixedSchema, isFixed, path, schema, nextOffset, parent,
    }) {
      return {
        parent,
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

      return props
        .filter(x => (fixedSchema[x] ? !fixedSchema[x]['ui:hidden'] : true))
        .map((key, offset) => ({
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
