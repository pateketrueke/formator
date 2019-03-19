import { defaultValue, getId } from '../../utils';

export default {
  components: {
    Field: '../../Field',
    Finder: '../../../Finder',
  },
  data() {
    return {
      result: null,
    };
  },
  methods: {
    sync(e, key) {
      const { schema, result } = this.get();

      this.set({
        result: {
          ...result,
          [key]: e || defaultValue(schema)[key],
        },
      });

      this.fire('sync');
    },
  },
  computed: {
    fixedSchema({ uiSchema }) {
      return uiSchema || {};
    },
    fixedValues({ result }) {
      return result || {};
    },
    fields({
      path, name, rootId, schema, fixedSchema,
    }) {
      if (!(schema && schema.properties)) {
        return [];
      }

      return Object.entries(schema.properties)
        .sort((a, b) => {
          if (fixedSchema[a[0]] && fixedSchema[b[0]]) {
            const x = fixedSchema[a[0]]['ui:hidden'];
            const y = fixedSchema[b[0]]['ui:hidden'];

            if (x || y) {
              return y - x;
            }
          }

          if (!fixedSchema['ui:order']) {
            return 0;
          }

          return fixedSchema['ui:order'].indexOf(b[0]) - fixedSchema['ui:order'].indexOf(a[0]);
        })
        .map(([key, props]) => ({
          id: getId(rootId, name !== '__ROOT__' ? `${name}[${key}]` : key, true),
          name: name !== '__ROOT__' ? `${name}[${key}]` : key,
          uiSchema: fixedSchema[key] || {},
          path: (path || []).concat(key),
          field: key,
          props,
        }), []);
    },
  },
};
