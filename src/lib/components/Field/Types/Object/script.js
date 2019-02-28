import { getId, sync } from '../../utils';

// FIXME: move autocomplete to a separated component!!!
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
  oncreate: sync,
  methods: {
    test(value) {
      if (typeof value !== 'undefined') {
        console.log('SYNC OBJECT', value);
      } else {
        console.log('CLEAR OBJECT');
        this.set({ result: null });
      }
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
