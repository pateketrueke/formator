/* global fetch, React, ReactDOM, JSONSchemaForm */

// FIXME: https://bvaughn.github.io/react-virtualized-select/
// FIXME: test normal forms without javascript, check _method and such
// FIXME: consider this and model.js into a separated module?
// FIXME: enhance <select> with something better

// FIXME: replace React with Vue
// FIXME: cancel actions?

// FIXME: cache on-the-fly-jsx-templates
// FIXME: precompute values from tpl-calls (see above)
// FIXME: the final state should be static... without no more transforms,
// or their transforms are calculated on the fly and stored to be reused...

import {
  RE_NUM,
  RE_SPACE,
  RE_NWORD,
  LAYERS } from './_/constants';

import { fixResource } from './_/helpers';

import Form from './_/Form';
import ResourceTable from './_/ResourceTable';

import { FieldTemplate, CheckBox, DateElement } from './_/fields';

function initTable(el, options) {
  fixResource(options);

  ReactDOM.render(<div className="json-form">
    <ResourceTable {...options} />
  </div>, el);
}

function initForm(el, options, callbacks) {
  fixResource(options);

  const ref = options.refs[options.model || options.schema.id] || {};

  Object.keys(options.schema.properties).forEach(key => {
    if (!options.result) {
      return;
    }

    const schema = options.schema.properties[key];
    const uiSchema = options.uiSchema[key];

    if (options.result[key] === null) {
      if (schema.type === 'string') {
        options.result[key] = '';
      }

      if (schema.type === 'number') {
        options.result[key] = undefined;
      }

      if (schema.type === 'boolean') {
        options.result[key] = false;
      }
    } else {
      if (schema.type === 'number') {
        options.result[key] = parseFloat(options.result[key]) || undefined;
      }

      if (schema.type === 'integer') {
        options.result[key] = parseInt(options.result[key], 10) || undefined;
      }
    }

    if (options.result[key] === '' || typeof options.result[key] === 'undefined') {
      delete options.result[key];
    }

    if (uiSchema && uiSchema['ui:prop'] && options.result[uiSchema['ui:prop']]) {
      options.result[key] = options.result[uiSchema['ui:prop']];
    }
  });

  const hasProps = Object.keys(options.schema.properties).length > 0;

  ReactDOM.render(<div className="json-form">
    <h2 className="form-title">
    {(options.title || options.uiSchema.title)
      ? (options.title || options.uiSchema.title)
      : <span>{options.isNew ? 'New' : 'Editing'} {ref.singular || 'Object'}</span>
    }
    </h2>
    {hasProps
      ? new Form(el, options, callbacks)
      : <div>
        <p>Unsupported schema for <code>{options.model}</code>: <em>Missing properties</em>.</p>
        <pre>{JSON.stringify(options.schema, null, 2)}</pre>
      </div>}
  </div>, el);
}

function initViewer(el, options) {
  fixResource(options);

  const ref = options.refs[options.model || options.schema.id] || {};

  ReactDOM.render(<div className="json-form">
    <h2 className="form-title">
    {(options.title || options.uiSchema.title)
      ? (options.title || options.uiSchema.title)
      : <span>Viewing {ref.singular || 'Object'}</span>
    }
    </h2>
    {React.createElement(reactJsonView.default, {
      src: options.result,
      collapsed: 1,
    })}
  </div>, el);
}

window.addEventListener('keyup', e => {
  if (e.keyCode === 27) {
    const last = LAYERS.pop();

    if (last) {
      last();
    }
  }
});

// expose private methods
document.currentScript.exports = {
  initForm,
  initTable,
  initViewer,
};
