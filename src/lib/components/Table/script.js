import { randId } from '../../shared/utils';

export default {
  components: {
    Value: '../Value',
  },
  data() {
    return {
      result: null,
      keys: [],
    };
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
