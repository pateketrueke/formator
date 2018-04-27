import {
  fixPayload,
  linkTo,
  fixData,
  postJSON,
  buildSchema,
  buildUISchema } from './helpers';

import Reference from './Reference';

import { FieldTemplate, CheckBox, DateElement } from './fields';

const Form = (el, options, callbacks) => React.createElement(JSONSchemaForm.default, {
  formData: fixData(options),
  schema: buildSchema(options),
  uiSchema: buildUISchema(options),
  widgets: {
    CheckboxWidget: CheckBox,
  },
  fields: {
    Datetime: props => DateElement(props, { el, options, callbacks }),
    Reference: props => new Reference(props, { el, options, callbacks }),
  },
  FieldTemplate,
  showErrorList: false,
  noHtml5Validate: true,
  onSubmit({ formData }) {
    if (callbacks && callbacks.onPayload) {
      callbacks.onPayload(formData);
      return;
    }

    el.classList.add('pending');

    // FIXME: smartly replace any :placeholder by looking into references...
    const refs = (options.refs[options.model || options.schema.id] || {}).references;
    const actions = options.actions[options.model || options.schema.id] || {};

    const property = refs ? refs.primaryKeys[0].prop : 'id';
    const placeholder = `:${property}`;

    const url = actions[options.isNew ? 'create' : 'update'];

    if (!url) {
      if (callbacks && callbacks.onSubmit) {
        callbacks.onSubmit(data);
        return;
      }
      console.log(options.isNew ? 'CREATE' : 'UPDATE', formData);
      return;
    }

    const data = fixPayload(options, refs, formData);

    postJSON(url, data, placeholder, property)
      .then(data => {
        if (data.status !== 'ok') {
          throw new Error(data.result);
        }

        el.classList.add('success');

        if (callbacks && callbacks.onSubmit) {
          callbacks.onSubmit(data);
        } else {
          setTimeout(() => {
            const index = options.actions[options.model || options.schema.id].index || {};
            const url = linkTo(data.redirect || index.path);

            if (url) {
              location.href = url;
            }
          }, data.timeout || 0);
        }
      })
      .catch(error => {
        alert(error.message);
        el.classList.add('errored');
      })
      .then(() => el.classList.remove('pending'));
  },
  onChange() {
    el.classList.remove('errored');

    if (!el.classList.contains('pending')) {
      el.classList.add('pending');
    }
  },
  onError(e) {
    if (!el.classList.contains('errored')) {
      el.classList.add('errored');
      console.log(e);
    }
  },
  children: <div className="form-group no-select">
    {!options.uiSchema['ui:actions'] || (options.uiSchema['ui:actions'].indexOf('update') > -1 || options.uiSchema['ui:actions'].indexOf('create') > -1)
      ? <button type="submit">{options.isNew ? 'Save' : 'Update'}</button>
      : null}
    {callbacks && callbacks.onClose
        ? <button onClick={e => callbacks.onClose(e)}>Cancel</button>
        : null}
    {!options.isNew && (!options.uiSchema['ui:actions'] || options.uiSchema['ui:actions'].indexOf('delete') > -1) ? <span>
      <span> or </span> <a href="#" className="destroy" onClick={e => {
        e.preventDefault();

        if (!confirm('Are you sure?')) {
          return;
        }

        el.classList.add('pending');

        const refs = options.refs[options.model || options.schema.id] || {};


        const property = refs.references ? refs.references.primaryKeys[0].prop : 'id';
        const placeholder = `:${property}`;


        const actions = options.actions[options.model || options.schema.id] || {};
        const url = actions.destroy;

        if (!url) {
          if (callbacks && callbacks.onDelete) {
            callbacks.onDelete(options.result);
            return;
          }
          console.log('DELETE', options.result);
          return;
        }

        postJSON(url, options.result, placeholder, property)
          .then(data => {
            el.classList.add('success');

            if (callbacks && callbacks.onDelete) {
              callbacks.onDelete(data);
            } else {
              location.href = linkTo(data.redirect || options.actions[options.model || options.schema.id].index.path);
            }
          })
          .catch(error => {
            alert(error.message);
            el.classList.add('errored');
          })
          .then(() => el.classList.remove('pending'));
      }}>DELETE</a>
    </span> : null}
  </div>,
});

export default Form;
