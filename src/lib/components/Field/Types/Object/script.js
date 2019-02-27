import { API, throttle } from '../../../../shared/utils';
import { getId, sync } from '../../utils';

export default {
  components: {
    Field: '../../Field',
  },
  data() {
    return {
      result: null,
    };
  },
  oncreate: sync,
  methods: {
    // FIXME: implement search and autocomplete?
    input: throttle(function $onInput(e) {
      if (!e.target.value) {
        // FIXME: hide dropdown, set form as invalid...
        console.log('CLEAR', e);
        return;
      }

      const { actions } = this.root.get();
      const { association } = this.get();

      API.call(actions[association.model].index).then(data => {
        if (data.status === 'ok') {
          // FIXME: open dropdown?
          // if empty, set form as invalid...
          console.log('SET', data.result);
        }
      });
    }, 260),
    keydown(e) {
      if (e.keyCode === 27 || e.keyCode === 38 || e.keyCode === 40) {
        if (e.keyCode === 27) this.input(e);
        e.preventDefault();
      }

      if (e.keyCode === 13) {
        this.input(e);
      }

      if (e.keyCode === 38) {
        console.log('MOVE UP');
      }

      if (e.keyCode === 40) {
        console.log('MOVE DOWN');
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
