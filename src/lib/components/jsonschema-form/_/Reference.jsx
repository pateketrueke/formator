import {
  fixResource,
  fixPayload,
  linkTo,
  getJSON,
  postJSON,
  getProperty } from './helpers';

import { LAYERS } from './constants';

/* global VirtualizedSelect */

const Select = VirtualizedSelect.default;

function initForm(target, options, callbacks) {
  console.log('RUN', target, options, callbacks);
  return jsonschemaForm.initForm(target, options, callbacks);
}

export default class Reference extends React.Component {
  constructor(props, options) {
    super(props);
    this._form = options;
    this.state = {
      options: [],
      value: [],
    };

    this.propSchema = this._form.options.uiSchema[this.props.schema.prop] || {};
    this.uiSchema = (this._form.options.refs[this.props.schema.prop] || {}).uiSchema
      || (this._form.options.refs[this.props.schema.ref.model] || {}).uiSchema
      || {};

    this.enabled = !(this.propSchema['ui:disabled'] || this.propSchema['ui:widget'] === 'hidden');
    this.template = this.propSchema['ui:template'] || this.uiSchema['ui:template'];

    // FIXME: adjust through-ref as main model
    const _target = this._form.options.refs[this.props.schema.prop];
    const _model = _target.through || _target.model;

    this.ref = _target;
    this.model = this._form.options.refs[_model] || {};

    this.pk = this.ref.references.primaryKeys[0];
    this.fk = this.ref.references.foreignKeys[0];

    this.actions = this._form.options.actions[_model];
    this.attributes = this._form.options.attributes || {};

    if (this.pk) {
      this.property = this.pk.prop;
      this.placeholder = `:${this.pk.prop}`;
    } else {
      // FIXME: ...
      this.property = 'key';
      this.placeholder = ':key';
    }

    if (!this.actions && !this.model.virtual) {
      throw new Error(`Missing actions for '${_model}' resource`);
    }

    if (this._form.options.result && this._form.options.result[this.props.schema.prop]) {
      this.state.value = this._form.options.result[this.props.schema.prop];
    }
  }

  // FIXME: implements several stages
  // - load data from parent model
  // - save data to parent model
  // - support more nesting
  // - improve callbacks

  componentDidMount() {
    if (!this.enabled || this.model.virtual) {
      return;
    }

    // FIXME: here is a big trouble...
    // different reference-widgets use options/value to display
    // their items, we need to refine how this will behave exactly:
    // - HAS_ONE:         options=LIST           value=SELECTED **NOT IMPLEMENTED YET
    // - BELONGS_TO:      options=LIST           value=SELECTED
    // - HAS_MANY:        options=LIST(filtered) value=SELECTED(items)
    // - BELONGS_TO_MANY: options=LIST(filtered) value=SELECTED(items) **NOT IMPLEMENTED YET

    const isMany = this.props.schema.ref.hasManyItems;

    if (isMany && this._form.options.isNew) {
      return;
    }

    const params = {};

    // FIXME: actually, get all values from DB but:
    // a) update state-values for choosing from them
    // b) just set current state-field with filtered ones

    if (this.attributes.where && this.attributes.where[this.props.name]) {
      params.where = this.attributes.where[this.props.name];
    }

    if (isMany && this._form.options.result && this._form.options.result[this.pk.prop]) {
      params.where = params.where || {};
      params.where[this.fk.prop] = this._form.options.result[this.pk.prop];
    }

    if (this._form.options.isNew) {
      getJSON(linkTo(this.actions.index), params)
        .then(data => {
          if (typeof data.result === 'object') {
            this.setState({
              [isMany ? 'value' : 'options']: data.result,
            });
            this.props.onChange(data.result);
          } else {
            console.log(data);
          }
        });
    }
  }

  openLayer(cb) {
    const target = document.createElement('div');

    this._form.el.parentNode.appendChild(target);

    target.classList.add('has-layers');

    const offset = LAYERS.length;

    let callbacks;

    function closeMe(e) {
      if (e.target === target) {
        callbacks.onClose();
      }
    }

    callbacks = cb(target, cb => {
      target.classList.add('active');
      target.addEventListener('click', closeMe);
      LAYERS.push(() => callbacks.onClose());
      cb(callbacks);
    }, e => {
      if (e) {
        e.preventDefault();
      }

      LAYERS.splice(offset, 1);

      target.classList.remove('active');
      target.removeEventListener('click', closeMe);

      ReactDOM.unmountComponentAtNode(target);
      target.parentNode.removeChild(target);
    });
  }

  editVirtual(e, idx) {
    e.preventDefault();

    this.openLayer((target, onOpen, _onClose) => {
      setTimeout(() => {
        onOpen(callbacks => {
          delete this._form.options.uiSchema[this.props.schema.prop]['ui:field'];

          initForm(target, {
            model: this.props.schema.prop,
            actions: this._form.options.actions,
            isNew: typeof idx === 'undefined',
            refs: this._form.options.refs,
            result: (this.props.formData || {})[idx],
            schema: this._form.options.refs[this.props.schema.ref.id],
            uiSchema: this._form.options.uiSchema[this.props.schema.prop] || {},
          }, callbacks);
        });
      }, 100);

      return {
        onPayload: payload => {
          this._form.options.uiSchema[this.props.schema.prop]['ui:field'] = 'Reference';

          if (idx >= 0) {
            this.state.value[idx] = payload;
            this.setState({ state: this.state });
            this.props.onChange(this.state.value);

            setTimeout(_onClose);
            return;
          }

          const value = this.props.schema.type === 'array'
            ? (this.state.value || []).concat(payload)
            : payload;

          this.setState({ value });
          this.props.onChange(value);

          _onClose();
        },
        onDelete(e) {
          console.log('DELETE');
          _onClose(e);
        },
        onSubmit() {
          console.log('SUBMIT');
        },
        onClose(e) {
          _onClose(e);
        },
      };
    });
  }

  // FIXME: use openLayer()

  openFrame(e, idx) {
    e.preventDefault();

    const target = document.createElement('div');

    this._form.el.parentNode.appendChild(target);

    target.classList.add('has-layers');

    const url = linkTo(e.target.href);

    const prev = location.href;

    getJSON({ path: url })
      .then(data => {
        window.history.replaceState({}, document.title, url);

        target.classList.add('active');

        const offset = LAYERS.length;
        const options = data.result || {};
        const callbacks = {};

        options.isNew = true;

        fixResource(options);

        Object.keys(options.schema.properties).forEach(prop => {
          const ui = options.uiSchema[prop];

          if (!ui || ui['ui:xdisabled'] === true) {
            options.uiSchema[prop] = { 'ui:disabled': true };

            if (options.schema.required && options.schema.required.indexOf(prop) !== -1) {
              options.schema.required.splice(options.schema.required.indexOf(prop), 1);
            }
          }
        });

        function closeMe(e) {
          if (e.target === target) {
            callbacks.onClose();
          }
        }

        const ref = this._form.options.refs[this.props.name];

        if (ref.hasManyItems) {
          callbacks.onPayload = payload => {
            callbacks.onClose();

            if (typeof idx !== 'undefined') {
              this.state.value.splice(idx, 1);
            }

            const data = fixPayload(options, ref.references, payload, true);

            this.setState({ value: this.state.value.concat(data) });
            this.props.onChange(this.state.value.concat(data));
          };
        }

        callbacks.onDelete = () => {
          callbacks.onClose();

          if (this.props.schema.ref.hasManyItems) {
            this.state.value.splice(offset, 1);
            this.setState({ value: this.state.value });
          } else {
            this.componentDidMount();
          }
        };

        callbacks.onSubmit = () => {
          callbacks.onClose();
          this.componentDidMount();
        };

        callbacks.onClose = e => {
          if (e) {
            e.preventDefault();
          }

          window.history.replaceState({}, document.title, prev);

          target.removeEventListener('click', closeMe);
          target.classList.remove('active');
          LAYERS.splice(offset, 1);

          setTimeout(() => {
            ReactDOM.unmountComponentAtNode(target);
            this._form.el.parentNode.removeChild(target);
          }, 200);
        };

        target.addEventListener('click', closeMe);
        LAYERS.push(() => callbacks.onClose());

        setTimeout(() => initForm(target, options, callbacks), 100);
      });
  }

  hasAction(value) {
    const actions = this.propSchema['ui:actions']
      || this.uiSchema['ui:actions'];

    return !actions || actions.indexOf(value) > -1;
  }

  singleItem(defaultTitle) {
    return defaultTitle || this._form.options.refs[this.props.schema.prop].singular || 'Object';
  }

  multipleItems(defaultTitle) {
    return defaultTitle || this._form.options.refs[this.props.schema.prop].plural || 'Objects';
  }

  renderActions() {
    if (this.propSchema['ui:editable'] === false || this.uiSchema['ui:editable'] === false) {
      return null;
    }

    const item = (this.propSchema['ui:placeholder'] || this.singleItem(this.uiSchema['ui:title'])).toLowerCase();

    if (this.model.virtual) {
      return <a href="#" onClick={e => this.editVirtual(e)}>Add new {item}</a>;
    }

    if (!this.hasAction('new') || !this.actions.new) {
      return null;
    }

    return <span>
      <a
        href={linkTo(this.actions.new.path)}
        onClick={e => this.openFrame(e)}
      >Add new {item}</a>
    </span>;

    // FIXME: edit links
    //    const addLink = <a
    //       href={this._form.options.actions[this.props.schema.ref.model].new.path}
    //       onClick={e => this.openFrame(e)}
    //     >Add new {this.props.schema.ref.singular.toLowerCase()}</a>;
    //    return this.props.formData && this.props.formData[this.props.schema.ref.primaryKey]
    //       ? <span>{addLink} or <a href={
    //         this._form.options.actions[this.props.schema.ref.model].edit.path.replace(/:id/, this.props.formData[this.props.schema.ref.primaryKey])
    //       } onClick={e => this.openFrame(e)}>EDIT</a></span>
    //       : addLink;
  }

  renderLabel() {
    return <label
      className={['field-label'].concat(this.props.required ? 'is-required' : []).join(' ')}
      htmlFor={this.props.idSchema.$id}
    >{this.singleItem(this.propSchema['ui:title'])}{this.props.required ? null : <small>optional</small>}</label>;
  }

  renderItems() {
    return <ol className="field-list">
      {this.state.value.length
        ? this.state.value.map((item, key) =>
            <li key={key} className="field-item">
              <a href="#" className="destroy" onClick={e => {
                e.preventDefault();

                const ref = this._form.options.refs[this.props.name];
                const model = ref.through || ref.model;
                const actions = this._form.options.actions[model];

                // FIXME: use proper callback...
                postJSON(actions.destroy, item, ':id', 'id')
                  .then(() => {
                    this.state.value.splice(key, 1);
                    this.setState({ value: this.state.value });
                  });
              }}><span className="is-icon remove" /></a>
              {this.model.virtual
                && <a href="#" onClick={e => this.editVirtual(e, key)}><span className="is-icon editable" /></a>}
              {item[this.property]
                ? <a href={
                    this.actions.edit.path.replace(this.placeholder, item[this.property])
                  } onClick={e => this.openFrame(e, key)}><span className="is-icon editable" /></a>
                : null}
              {getProperty(item, this.template || '-', this._form.el)}
            </li>)
        : <li><small>No {this.multipleItems(this.ref.plural).toLowerCase()} found</small></li>}
      </ol>;
  }

  renderDesc() {
    const desc = (this._form.options.uiSchema[this.props.schema.prop] || {})['ui:description']
      || (this._form.options.schema[this.props.schema.prop] || {}).description;

    return desc && <p className="field-description">{desc}</p>;
  }

  renderVirtual() {
    return <div><div className="field-group">{this.renderLabel()}
        <div className="field-control">{this.renderItems()}
        <span>{this.renderActions()}</span>
        </div>
      </div>
      {this.renderDesc()}
    </div>;
  }

  renderMany() {
    return <div><div className="field-group">{this.renderLabel()}
      <div className="field-control">{this.renderItems()}
      {this.state.options.length && this.hasAction('select')
        ? <Select
            name={this.props.name}
            id={this.props.idSchema.$id}
            placeholder={`Search in ${this.multipleItems(this.propSchema['ui:title']).toLowerCase()}...`}
            options={this.state.options.map((item, key) => ({
              value: item[this.pk.prop],
              label: getProperty(item, this.template || '-', this._form.el),
            }))}
            onChange={e => {
              let value = e.value;

              if (this.pk.type === 'integer' || this.pk.type === 'number') {
                value = parseInt(value, 10);
              }

              const result = this.state.options
                .filter(item => item[this.pk.prop] === value)[0];

              this.setState({ value: this.state.value.concat(result) });
              this.props.onChange(this.state.value.concat(result));
            }}
          />
        : null}
      <span>{this.renderActions()}</span>
      </div></div>
    {this.renderDesc()}
    </div>;
  }

  renderOne() {
    return <div><div className="field-group field">{this.renderLabel()}
      <div className="field-control">
        {this.hasAction('select') ? <Select
          name={this.props.name}
          id={this.props.idSchema.$id}
          value={this.state.value ? this.state.value[this.pk.prop] : null}
          placeholder={`Search in ${this.multipleItems(this.propSchema['ui:title']).toLowerCase()}...`}
          options={this.state.options.map(x => ({
            value: x[this.pk.prop],
            label: getProperty(x, this.template || '-', this._form.el),
          }))}
          singleValue
          onChange={e => {
            if (e === null) {
              // FIXME: field or props?
              this.props.onChange(undefined);
              this.setState({ value: undefined });
            } else {
              const foundValue = this.state.options
                .filter(x => x[this.pk.prop] === e.value)[0];

              this.props.onChange(foundValue);
              this.setState({ value: foundValue });
            }
          }}
        /> : null}
      {this.renderActions()}</div></div>
    {this.renderDesc()}
    </div>;
  }

  render() {
    if (!this.enabled) {
      return null;
    }

    if (this.model.virtual) {
      return this.renderVirtual();
    }

    if (this.ref.hasManyItems) {
      return this.renderMany();
    }

    return this.renderOne();
  }
}
