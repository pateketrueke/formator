import { defaultValue, sync } from '../Field/utils';
import { API, randId } from '../../shared/utils';

export default {
  components: {
    Field: '../Field',
    Value: '../Value',
    Modal: '../Modal',
    Catch: '../Catch',
  },
  data() {
    return {
      result: null,
      value: {},
      keys: [],
    };
  },
  oncreate: sync,
  // FIXME: generalize all API methods, reuse then!
  methods: {
    sync() {
      const {
        offset, value, values, model, actions,
      } = this.get();

      if (offset >= 0) {
        API.call(actions[model].update, value)
          .then(data => {
            if (data.status === 'ok') {
              // FIXME: UI is not being synced...
              values[offset] = {};
              this.set({ result: values.slice() });

              values[offset] = data.result;
              this.set({ result: values.slice(), value: {} });
              this.fire('sync');
            }
          });
      } else {
        API.call(actions[model].create, value)
          .then(() => {
            this.set({
              result: values.concat(value),
              value: {},
            });

            this.fire('sync');
          });
      }
    },
    remove(offset) {
      const {
        actions, values, model, keys,
      } = this.get();

      API.call(actions[model].destroy, values[offset]).then(data => {
        if (data.status === 'ok') {
          values.splice(offset, 1);
          keys.splice(offset, 1);
          this.set({ values, keys });
        }
      });
    },
    edit(offset) {
      const { schema, values } = this.get();

      this.set({
        offset,
        isOpen: true,
        value: offset >= 0 ? values[offset] : defaultValue(schema),
      });
    },
    load() {
      const { model, actions } = this.get();

      this.set({
        payload: API.call(actions[model].index).then(data => {
          if (data.status === 'ok') {
            this.set({ result: data.result });
          }
        }),
      });
    },
  },
  computed: {
    fixedSchema({ uiSchema }) {
      return uiSchema || {};
    },
    fieldProps({ schema, uiSchema }) {
      return { props: schema, uiSchema };
    },
    headers({ fixedSchema, schema }) {
      const props = schema.properties
        ? Object.keys(schema.properties)
        : [];

      return props.map((key, offset) => ({
        label: (fixedSchema['ui:headers'] && fixedSchema['ui:headers'][offset]) || key,
        field: key,
      })).filter(x => fixedSchema[x.field] && !fixedSchema[x.field]['ui:hidden']);
    },
    values({ result }) {
      return result || [];
    },
    items({
      fixedSchema, path, schema, values, keys,
    }) {
      return values.map((data, offset) => {
        const key = keys[offset] || (keys[offset] = randId());

        return {
          path: (path || []).concat(offset),
          uiSchema: fixedSchema,
          props: schema,
          offset,
          key,
        };
      });
    },
  },
};
