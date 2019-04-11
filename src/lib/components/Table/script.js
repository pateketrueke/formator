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
      association: {
        singular: 'Item',
        plural: 'Items',
      },
      refs: {},
      uiSchema: {},
      result: null,
      value: {},
      keys: [],
    };
  },
  oncreate() {
    sync.call(this);
  },
  // FIXME: generalize all API methods, reuse then!
  methods: {
    reset() {
      this.set({
        offset: undefined,
      });
    },
    sync() {
      const {
        offset, value, values, model, actions, refs,
      } = this.get();

      const pk = refs[model].references.primaryKeys[0].prop;

      if (actions) {
        if (offset >= 0) {
          API.call(actions[model].update, value)
            .then(data => {
              if (data.status === 'ok') {
                // FIXME: UI is not being synced...
                values[offset] = {};
                this.set({ result: values.slice() });

                values[offset] = value;
                this.set({ result: values.slice(), value: {} });
              }
            });
        } else {
          API.call(actions[model].create, value)
            .then(data => {
              if (data.status === 'ok') {
                value[pk] = data.result;

                this.set({
                  result: values.concat(value),
                  value: {},
                });
              }
            });
        }
      }
    },
    remove(offset) {
      const {
        actions, values, model, keys,
      } = this.get();

      // FIXME: clean this!!!
      const next = () => {
        values.splice(offset, 1);
        keys.splice(offset, 1);
        this.set({ values, keys });
      };

      if (actions) {
        API.call(actions[model].destroy, values[offset]).then(data => {
          if (data.status === 'ok') {
            next();
          }
        });
      } else {
        next();
      }
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
      const { model, result, actions } = this.get();

      if (result) {
        this.set({
          payload: Promise.resolve()
            .then(() => this.set({ result })),
        });
      } else if (actions) {
        this.set({
          payload: API.call(actions[model].index).then(data => {
            if (data.status === 'ok') {
              this.set({ result: data.result });
            }
          }),
        });
      }
    },
  },
  computed: {
    fixedSchema({ uiSchema }) {
      return uiSchema || {};
    },
    fieldProps({ schema, uiSchema }) {
      return { props: schema, uiSchema };
    },
    isUpdate({ offset }) {
      return typeof offset !== 'undefined';
    },
    headers({ fixedSchema, schema }) {
      const props = schema.properties
        ? Object.keys(schema.properties)
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
