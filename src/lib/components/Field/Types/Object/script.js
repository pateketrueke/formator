import { defaultValue, getId } from '../../utils';

export default {
  components: {
    Field: '../../Field',
    Value: '../../../Value',
    Finder: '../../../Finder',
  },
  data() {
    return {
      result: null,
    };
  },
  onupdate() {
    const { parent, fixedValues } = this.get();

    if (parent) {
      Object.assign(fixedValues, parent);

      this.set({
        fixedValues,
      });
    }
  },
  oncreate() {
    const { refs } = this.root.get();
    const { schema } = this.get();

    this.set({
      ref: refs[schema.id],
    });
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
    },
  },
  computed: {
    fixedSchema({ uiSchema }) {
      return uiSchema || {};
    },
    fixedValues({ result }) {
      return result || {};
    },
    fixedResult({ fixedValues, schema, ref }) {
      const out = {};

      if (ref && ref.references) {
        ref.references.primaryKeys.forEach(key => {
          const fk = `${schema.id}${key.prop[0].toUpperCase() + key.prop.substr(1)}`;

          out[fk] = out[fk] || fixedValues[key.prop];
        });
      }

      return out;
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
