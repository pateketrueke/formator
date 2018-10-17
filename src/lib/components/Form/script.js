import { randId, clean } from '../../shared/utils';
import { getAjv } from '../../shared/deps'; // eslint-disable-line

function showError(field, target) {
  const selector = `[data-field="${field}"]`;
  const el = target.querySelector(selector);

  if (el) {
    el.classList.add('invalid');
  }
}

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
  methods: {
    validate() {
      if (this._locked) return;
      this._locked = true;

      const {
        schema, value, props, refs,
      } = this.get();

      const { target } = this.options;

      getAjv().then(() => {
        if (!this.ajv) {
          this.ajv = new Ajv({
            validateSchema: false,
            jsonPointers: true,
            allErrors: true,
            logger: false,
          });

          Object.keys(refs).forEach(ref => {
            if (refs[ref].id || refs[ref].definitions) {
              this.ajv.addSchema(refs[ref], ref);
            }
          });
        }

        [].slice.call(target.querySelectorAll('[data-field]'))
          .forEach(node => {
            node.classList.remove('invalid');
          });

        this.set({
          isValid: this.ajv.validate({ ...props, ...schema }, clean(value)),
        });

        (this.ajv.errors || []).forEach(error => {
          // FIXME: this is working... but MUST be implemented at Field level?
          console.log({ ...props, schema });
          console.log(clean(value));
          console.log(error);

          if (error.dataPath) {
            showError(error.dataPath, target);

            const field = error.params.missingProperty;

            if (field) {
              showError(`${error.dataPath}/${field}`, target);
            }
          } else {
            showError(`/${error.params.missingProperty}`, target);
          }
        });

        this._locked = false;
      });
    },
    save(e) {
      e.preventDefault();

      console.log('IS_VALID?', this.get());
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
