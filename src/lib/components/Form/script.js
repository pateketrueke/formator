import { randId, clean } from '../../shared/utils';
import { getAjv } from '../../shared/deps'; // eslint-disable-line

const ACTION_MAP = {
  new: 'create',
};

/* global Ajv */

export default {
  components: {
    Field: '../Field',
  },
  data() {
    return {
      refs: {},
      rootId: randId(),
    };
  },
  oncreate() {
    getAjv().then(() => {
      this.ajv = new Ajv({
        validateSchema: false,
        jsonPointers: true,
        allErrors: true,
        logger: false,
      });

      const { refs } = this.get();

      Object.keys(refs).forEach(ref => {
        if (refs[ref].id || refs[ref].definitions) {
          this.ajv.addSchema(refs[ref], ref);
        }
      });
    });
  },
  methods: {
    save(e) {
      if (e) {
        e.preventDefault();
      }

      const { value, schema } = this.get();

      const data = clean(value);
      const pass = this.ajv.validate(schema, data);

      console.log(pass, this.ajv.errors);
    },
  },
  computed: {
    currentAction({ schema, action, actions }) {
      if (schema && actions) {
        return actions[schema.id][action];
      }
    },
    nextAction({ schema, action, actions }) {
      if (schema && actions) {
        return actions[schema.id][ACTION_MAP[action]];
      }
    },
    value({ result, schema }) {
      if (!schema) {
        return undefined;
      }

      if (!result) {
        return schema.type === 'array' ? [] : {};
      }

      return result;
    },
    fixedSchema({ uiSchema }) {
      return uiSchema || {};
    },
    fieldProps({ schema, uiSchema }) {
      return { props: schema, uiSchema };
    },
    formProps({ nextAction }) {
      if (nextAction) {
        return {
          method: 'post',
          action: nextAction.path,
        };
      }
    },
  },
};
