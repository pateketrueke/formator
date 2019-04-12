import { randId, clean } from '../../shared/utils';

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
      uiSchema: {},
      rootId: randId(),
    };
  },
  oncreate() {
    this.on('update', ({ changed, current }) => {
      if (changed.value && current.schema) {
        this.validate(current);
      }
    });
  },
  methods: {
    validate(subSchema) {
      if (this._locked) return;
      this._locked = true;

      const { target } = this.options;

      if (!target) return;

      const {
        schema, value, refs,
      } = this.get();

      if (typeof window.Ajv !== 'undefined') {
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
            if (node) node.classList.remove('invalid');
          });

        let _schema = schema;

        if (subSchema.through) {
          _schema = {
            ...schema,
            properties: {
              ...schema.properties,
              [subSchema.field]: {
                ...subSchema.props,
                ...subSchema.schema,
              },
            },
          };
        }

        this.set({
          isValid: this.ajv.validate(_schema, clean(value)),
        });

        (this.ajv.errors || []).forEach(error => {
          console.log(error);

          if (error.dataPath) {
            showError(error.dataPath, target);

            const prop = error.params.missingProperty;

            if (prop) {
              showError(`${error.dataPath}/${prop}`, target);
            }
          } else {
            showError(`/${error.params.missingProperty}`, target);
          }
        });

        setTimeout(() => {
          this._locked = false;
        }, 100);
      }
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
        return actions[schema.id][ACTION_MAP[action]] || {};
      }

      return {};
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
