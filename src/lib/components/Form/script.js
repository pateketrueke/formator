import { randId, clean } from '../../shared/utils';
import { getAjv } from '../../shared/deps'; // eslint-disable-line

const ACTION_MAP = {
  new: 'create',
};

function showError(field, target) {
  const selector = `[data-field="${field}"]`;
  const el = target.querySelector(selector);

  if (el) {
    el.classList.add('invalid');
  }
}

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
      const { target } = this.options;

      const data = clean(value);

      [].slice.call(target.querySelectorAll('[data-field]'))
        .forEach(node => {
          node.classList.remove('invalid');
        });

      this.ajv.validate(schema, data);

      (this.ajv.errors || []).forEach(error => {
        showError(error.dataPath || `/${error.params.missingProperty}`, target);

        if (error.dataPath) {
          showError(`${error.dataPath}/${error.params.missingProperty}`, target);
        }
      });
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
