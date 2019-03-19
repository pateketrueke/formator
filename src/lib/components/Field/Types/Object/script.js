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
    hidden({
      path, name, rootId, schema, fixedSchema,
    }) {
      if (!(schema && schema.properties)) {
        return [];
      }

      // FIXME: how to reuse?
      return Object.entries(schema.properties)
        .filter(x => fixedSchema[x[0]] && fixedSchema[x[0]]['ui:hidden'])
        .map(([key, props]) => ({
          id: getId(rootId, name !== '__ROOT__' ? `${name}[${key}]` : key, true),
          name: name !== '__ROOT__' ? `${name}[${key}]` : key,
          path: (path || []).concat(key),
          field: key,
          props,
        }), []);
    },
    fields({
      path, name, rootId, schema, fixedSchema,
    }) {
      if (!(schema && schema.properties)) {
        return [];
      }

      return Object.entries(schema.properties)
        .filter(x => (fixedSchema[x[0]] ? !fixedSchema[x[0]]['ui:hidden'] : true))
        .sort((a, b) => {
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
