import { randId } from '../../shared/utils';
import { defaultValue } from '../Field/utils';

export default {
  components: {
    Form: '../Form',
    Field: '../Field',
    Value: '../Value',
    Modal: '../Modal',
  },
  data() {
    return {
      result: null,
      value: {},
      keys: [],
    };
  },
  methods: {
    append() {
      const { schema } = this.get();

      this.set({
        isOpen: true,
        value: defaultValue(schema),
      });
    },
    add() {
      const { value, values } = this.get();

      this.set({
        result: values.concat(value),
        value: {},
      });
    },
  },
  computed: {
    fixedSchema({ uiSchema }) {
      return uiSchema || {};
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
    fieldProps({ schema, uiSchema }) {
      return { props: schema, uiSchema };
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
