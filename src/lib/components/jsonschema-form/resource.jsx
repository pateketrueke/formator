/* global fetch, React, ReactDOM, JSONSchemaForm */

// FIXME: test normal forms without javascript, check _method and such
// FIXME: consider this and model.js into a separated module?
// FIXME: enhance <select> with something better

// FIXME: replace React with Vue
// FIXME: cancel actions?

const RE_PLACEHOLDER = /\{(?:(@?[\w.]+)(?::([\w*,.]+))?([|?!])?(.*?))\}/;
const RE_DATA_BASE64 = /^data:(.+?);base64,/;
const RE_NUM = /^\d+/;
const RE_SPACE = /\s+/;
const RE_NWORD = /\W+/g;

const HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

const LAYERS = [];

const TYPES = {
  debug(data, values, parentNode) {
    return <pre>{JSON.stringify({ data, values }, null, 2)}</pre>;
  },
  embed(data, values, parentNode) {
    let fileName;

    if (!values.length) {
      return 'NOIMG';
    }

    if (values[0].indexOf('data:') > -1) {
      fileName = values[0].match(RE_DATA_BASE64)[1].split(';')[1].split('name=')[1];
    } else {
      fileName = values[0];
    }

    if (values[1]) {
      fileName = values[1];
    }

    return <a
      href={values[0]}
      target="_blank"
      onClick={e => {
        if (e.metaKey || e.ctrlKey) {
          return;
        }

        e.preventDefault();

        const target = document.createElement('div');

        parentNode.appendChild(target);

        target.setAttribute('data-title', fileName);
        target.classList.add('has-layers');
        target.classList.add('overlay');

        const offset = LAYERS.length;

        function closeMe(e) {
          if (e && (e.target !== target)) {
            return;
          }

          LAYERS.splice(offset, 1);
          parentNode.removeChild(target);
        }

        target.addEventListener('click', closeMe);
        LAYERS.push(() => closeMe());

        setTimeout(() => {
          target.classList.add('active');

          setTimeout(() => {
            const display = !values[0].match(/\.(svg|gif|png|jpe?g)$/)
              ? document.createElement('iframe')
              : document.createElement('img');

            if (display.tagName === 'IFRAME') {
              display.setAttribute('width', 853);
              display.setAttribute('height', 505);
            }

            display.style.opacity = 0;
            display.src = values[0];

            target.appendChild(display);

            setTimeout(() => {
              display.style.opacity = 1;
            }, 100);
          }, 100);
        });
      }}
    >{fileName}</a>;
  },
  sum(data, values) {
    return values.map(x => x.reduce((prev, cur) => prev + cur, 0)).join(', ');
  },
  val(data, values) {
    return values[0].join(', ');
  },
};

function fixResource(context) {
  // normalize context
  context.action = context.action || (context.isNew ? 'new' : '');
  context.result = context.result || {};
  context.model = context.model || 'Object';
  context.refs = context.refs || {};

  context.schema = context.schema || {};
  context.schema.id = context.schema.id || context.model;
  context.schema.type = context.schema.type || 'object';
  context.schema.properties = context.schema.properties || {};

  context.uiSchema = context.uiSchema || {};
  context.actions = context.actions || {};
}

function linkTo(url, params) {
  if (params) {
    Object.keys(params).forEach(prop => {
      url = url.replace(`:${prop}`, params[prop]);
    });
  }

  if (location.search) {
    const q = location.search.split('?')[1];

    return `${url}${url.indexOf('?') === -1 ? '?' : '&'}${q}`;
  }

  return url;
}

function merge(target) {
  Array.prototype.slice.call(arguments, 1).forEach(source => {
    if (source) {
      Object.keys(source).forEach(key => {
        if (typeof target[key] === 'undefined') {
          target[key] = source[key];
        }
      });
    }
  });

  return target;
}

// FIXME: there is a standard way?
function paramify(obj) {
  const out = [];

  Object.keys(obj).forEach(k => {
    if (typeof obj[k] === 'object') {
      out.push(`${k}:${paramify(obj[k])}`);
    } else {
      out.push(`${k}:${obj[k]}`);
    }
  });

  return out.join(';');
}

function fetchCall(url, options) {
  console.log(options.method || 'GET', url, options.body);

  return fetch(url, options);
}

function getJSON(payload, query) {
  const q = [];

  if (query) {
    Object.keys(query).forEach(prop => {
      q.push((q.length ? '&' : '?'));

      if (typeof query[prop] === 'object') {
        q.push(`${prop}=${paramify(query[prop])}`);
      } else {
        q.push(`${prop}=${query[prop]}`);
      }
    });
  }

  return fetchCall(`${payload.path}${q.join('')}`, {
    credentials: 'same-origin',
    headers: HEADERS,
  })
  .then(resp => resp.json());
}

function fixData(options) {
  options.result = options.result || {};

  Object.keys(options.schema.properties).forEach(prop => {
    const field = options.schema.properties[prop];

    if (options.result[prop] === null) {
      delete options.result[prop];
    }

    if (field.$ref && options.isNew) {
      options.result[prop] = undefined;
    }
  });

  return options.result;
}

// FIXME: add proper replace for :params

function postJSON(payload, formData, param, prop) {
  return fetchCall(linkTo(payload.path.replace(param, formData[prop])), {
    credentials: 'same-origin',
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({
      payload: formData,
      _method: payload.verb,
    }),
  })
  .then(resp => resp.json());
}

function buildSchema(options) {
  Object.keys(options.schema.properties).forEach(prop => {
    const value = options.schema.properties[prop];
    const ref = (value.items || value).$ref;

    if (ref) {
      const schema = (value.items || value).virtual
        ? options.refs[ref]
        : options.refs[prop];

      options.schema.properties[prop] = {
        type: value.type || 'object',
        rel: typeof schema.through.model === 'string'
          ? schema.through.model
          : schema.through,
        ref: schema,
        prop,
      };

      // FIXME: adjust these schemas properly, separate state from data!
      if (value.type === 'array' || prop === 'items') {
        options.schema.properties[prop].type = 'array';
        options.schema.properties[prop].items = { type: 'object' };
      }
    }
  });

  return options.schema;
}

function buildUISchema(options) {
  const ref = options.refs[options.model || options.schema.id] || {};

  options.uiSchema['ui:rootFieldId'] = ref.singular || 'Object';

  Object.keys(options.schema.properties).forEach(prop => {
    if (options.schema.properties[prop].ref) {
      options.uiSchema[prop] = merge({}, options.uiSchema[prop], options.refs[prop].uiSchema);
      options.uiSchema[prop]['ui:field'] = 'Reference';
    }

    // FIXME: use a generic strategy here (date, time, etc.)
    if (options.schema.properties[prop].format === 'datetime' || options.schema.properties[prop].format === 'date-time') {
      options.uiSchema[prop] = merge({}, options.uiSchema[prop], (options.refs[prop] || {}).uiSchema);
      options.uiSchema[prop]['ui:field'] = 'Datetime';
    }
  });

  return options.uiSchema;
}

function getProperty(data, template, parentNode) {
  if (Array.isArray(template)) {
    return renderFromAST(template, data, parentNode);
  }

  if (typeof template === 'string') {
    let copy = template;
    let matches;

    const values = [];

    do {
      matches = copy.match(RE_PLACEHOLDER);

      if (matches) {
        values.push({
          expression: matches[1],
          property: (matches[2] || '')
            .split(',')
            .filter(x => x),
          operator: matches[3],
          value: matches[4],
        });

        copy = copy.replace(matches[0], '\0');
      }
    } while (matches);

    const parts = copy.split('\0');
    const result = [];

    while (values.length || parts.length) {
      result.push(parts.shift());
      result.push(values.shift());
    }

    return result.filter(x => x).reduce((prev, cur, i) => {
      if (typeof cur === 'string') {
        prev.push(cur)
      } else {
        let retval;

        if (cur.expression.charAt() === '@') {
          const values = cur.property
            .map(x => getProp(data, x) || cur.value);

          try {
            retval = TYPES[cur.expression.substr(1)](data, values, parentNode);
          } catch (e) {
            prev.push(<div key={`err_${i}`}>Error in expression:<pre>{JSON.stringify(cur, null, 2)}</pre></div>);
          }
        } else {
          retval = getProp(data, cur.expression);
        }

        if (typeof retval === 'undefined' && cur.operator === '|') {
          retval = getProp(data, cur.value);
        } else if (!retval && cur.operator === '!') {
          prev.push(cur.value);

          return prev;
        }

        if (typeof retval !== 'undefined' && retval !== null) {
          if (cur.operator === '?') {
            retval = cur.value;
          }

          if (typeof retval === 'object' && !React.isValidElement(retval)) {
            retval = <pre key={`obj_${i}`}>{JSON.stringify(retval, null, 2)}</pre>;
          }

          prev.push(retval);
        }
      }

      return prev;
    }, []);
  }

  return template;
}

function renderFromAST(ast, data, parentNode, parentGroup) {
  if (Array.isArray(ast)) {
    if (typeof ast[0] === 'string') {
      const tag = ast[0];

      let attrs = typeof ast[1] === 'object' && !Array.isArray(ast[1])
        ? ast[1]
        : null;

      if (attrs) {
        Object.keys(attrs).forEach(key => {
          attrs[key] = getProperty(data, attrs[key], parentNode);
        });
      }

      const children = renderFromAST(ast[2] || ast[1], data, parentNode)

      if (parentGroup) {
        attrs = attrs || {};
        attrs.key = attrs.key || parentGroup;
      }

      if (tag === 'input') {
        return React.createElement(tag, attrs);
      }

      return React.createElement(tag, attrs, children.map(x => getProperty(data, x, parentNode)));
    }

    if (Array.isArray(ast[0])) {
      return ast.map((x, k) => renderFromAST(x, data, parentNode, k + 1));
    }
  }

  if (typeof ast === 'string' || typeof ast === 'number' || typeof ast === 'boolean') {
    return getProperty(data, ast, parentNode);
  }

  return <div>
    <span>Invalid template syntax</span>
    <pre>{JSON.stringify(ast, null, 2)}</pre>
  </div>;
}

function _fixPayload(options, refs, payload, keepReferences) {
  const data = merge({}, payload);

  Object.keys(options.refs).forEach(prop => {
    if (options.refs[prop].references) {
      const pk = options.refs[prop].references.primaryKeys[0];

      if (data[prop] && typeof data[prop][pk.prop] !== 'undefined') {
        data[options.refs[prop].model] = data[prop];
        data[prop] = data[prop][pk.prop];
      }

      if (!keepReferences && options.refs[prop]) {
        delete data[options.refs[prop].model];
      }
    }
  });

  if (refs.foreignKeys) {
    refs.foreignKeys.forEach(fk => {
      if (typeof data[fk.prop] == 'object') {
        data[fk.prop] = undefined;
      }
    });
  }

  return data;
}

class Reference extends React.Component {
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

    this.rel = this._form.options.schema.properties[this.props.schema.prop].rel || {};
    this.ref = this._form.options.refs[this.props.schema.prop] || {};
    this.model = this._form.options.refs[this.ref.model] || {};

    this.pk = this.ref.references.primaryKeys[0];
    this.fk = this.ref.references.foreignKeys[0];

    this.actions = this._form.options.actions[this.rel || this.ref.model];
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
      throw new Error(`Missing actions for '${this.rel || this.ref.model}' resource`);
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

    const isMany = this.props.schema.ref.rel.indexOf('Many') > -1;

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

        const refs = this.props.schema.ref.references || {};

        if (refs.foreignKeys) {
          options.uiSchema = options.uiSchema || {};

          refs.foreignKeys.forEach(fk => {
            if (!options.uiSchema[fk.prop]
              || options.uiSchema[fk.prop]['ui:xdisabled'] === true) {
              options.uiSchema[fk.prop] = { 'ui:disabled': true };

              if (options.schema.required && options.schema.required.indexOf(fk.prop) !== -1) {
                options.schema.required.splice(options.schema.required.indexOf(fk.prop), 1);
              }
            }
          });
        }

        function closeMe(e) {
          if (e.target === target) {
            callbacks.onClose();
          }
        }

        if (this.props.schema.ref.rel.indexOf('Many') > -1) {
          callbacks.onPayload = payload => {
            callbacks.onClose();

            if (typeof idx !== 'undefined') {
              this.state.value.splice(idx, 1);
            }

            const data = _fixPayload(options, refs, payload, true);

            this.setState({ value: this.state.value.concat(data) });
            this.props.onChange(this.state.value.concat(data));
          };
        }

        callbacks.onDelete = () => {
          callbacks.onClose();

          if (this.props.schema.ref.rel.indexOf('Many') > -1) {
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
                this.state.value.splice(key, 1);
                this.setState({ value: this.state.value });
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

    if (this.ref.rel.indexOf('Many') > -1) {
      return this.renderMany();
    }

    return this.renderOne();
  }
}

function FieldTemplate(props) {
  const {id, classNames, label, help, hidden, required, description, errors, children, displayLabel} = props;

  if (hidden || !displayLabel) {
    return <div className={classNames}>{children}{errors}{help}</div>;
  }

  return <div className={classNames}>
     <div className="field-group">
       <label className={
         ['field-label'].concat(required ? 'is-required' : []).join(' ')
       } htmlFor={id}>{label}{required ? null : <small>optional</small>}</label>
       {children}
     </div>
     {description}
     {errors}
     {help}
  </div>;
}

function CheckBox(props) {
  const {id, disable, readonly, label, value, disabled, required, autofocus, onChange, classNames} = props;

  const description = props.options.description || props.schema.description;

  return <div>
    <div className={`field-group checkbox ${disabled || readonly ? 'disabled' : ''}`}>
      <label className={
        ['field-label'].concat(required ? 'is-required' : []).join(' ')
      } htmlFor={id}>
        {props.options.title || label}
      </label>
      <input
        type="checkbox"
        id={id}
        checked={typeof value === 'undefined' ? false : value}
        required={required}
        disabled={disabled || readonly}
        autoFocus={autofocus}
        onChange={e => onChange(e.target.checked)}
      />
    </div>
    {description && <p className="field-description">{description}</p>}
  </div>;
}

// FIXME: extend from ui:schema props
const DateTime = (props, params) => React.createElement(Datetime, {
  onChange: e => {
    props.onChange(e.toDate().toISOString());
  },
  value: props.formData ? new Date(props.formData) : undefined,
  inputProps: {
    id: props.idSchema.$id,
  },
  closeOnTab: true,
  closeOnSelect: true,
});

function dateFactory(props, params) {
  const desc = props.uiSchema['ui:description'] || props.schema['ui:description'];
  const title = props.uiSchema['ui:title'] || props.schema['ui:title'] || props.name;

  return <div><div className="field-group field">
    <label
      htmlFor={props.idSchema.$id}
      className={['field-label'].concat(props.required ? 'is-required' : []).join(' ')}
    >{title}</label>
    <div className="field-control">{new DateTime(props, params)}</div></div>
  {desc && <p className="field-description">{desc}</p>}
  </div>;
}

const Form = (el, options, callbacks) => React.createElement(JSONSchemaForm.default, {
  formData: fixData(options),
  schema: buildSchema(options),
  uiSchema: buildUISchema(options),
  widgets: {
    CheckboxWidget: CheckBox,
  },
  fields: {
    Datetime: props => dateFactory(props, { el, options, callbacks }),
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

    const data = _fixPayload(options, refs, formData);

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

function getProp(from, key) {
  if (!key) {
    return null;
  }

  const keys = key.split('.');

  let o = from;
  let k;

  try {
    for (let i = 0;;) {
      if (!keys.length) {
        break;
      }

      k = keys.shift();
      o = o[k];

      if (Array.isArray(o)) {
        if (keys[i] === '*') {
          return o.map(y => getProp(y, keys.slice(i + 1).join('.')));
        }
        o = o[0];
      }
      i++;
    }
  } catch (e) {
    return null;
  }

  return o;
}

function ifDef() {
  const args = Array.prototype.slice.call(arguments);

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] !== null && typeof args[i] !== 'undefined') {
      return args[i];
    }
  }
}

function getText(value) {
  if (Array.isArray(value)) {
    return value.map(getText);
  }

  if (value && typeof value === 'object') {
    return Object.keys(value).map(key => getText(value[key])).join('\n');
  }

  return value;
}

class ResourceTable extends React.Component {
  constructor(options) {
    super(options);

    const _fields = options.uiSchema['ui:fields'] || options.schema.required || [];

    if (!Array.isArray(_fields)) {
      throw new Error('Expecting ui:fields to be an array, given ' + typeof _fields);
    }

    this.params = {};
    this.fields = _fields
      .map(prop => {
        const obj = typeof prop === 'string' ? { prop } : prop;

        if (obj.prop && options.schema.properties[obj.prop]) {
          obj.enum = options.schema.properties[obj.prop].enum;
          obj.value = null;
        }

        return obj;
      });

    this.ref = options.refs[options.model || options.schema.id] || {};
    this.total = (options.result || {}).length || 0;
    this.current = 1;
    this.items = 10;

    // FIXME: allow multiple PKs
    this.property = this.ref.references ? this.ref.references.primaryKeys[0].prop : 'id';
    this.placeholder = `:${this.property}`;

    this.state = {
      fields: this.fields,
      data: [],
      pages: 0,
    };
  }

  componentDidMount() {
    this._doIndex();
    this._doFocus();
    this._doFiltering();
    this._doPagination();

    this._el = ReactDOM.findDOMNode(this);
  }

  _assign(key, type, checked) {
    this.fields[key][type] = checked;
  }

  _doIndex() {
    // FIXME: skip refs/ids from indexing
    this.indexes = getText(this.props.result) || [];
  }

  _doFilter() {
    this.setState({
      fields: this.fields
        .filter(x => x.isShown !== false && (x.prop ? x.prop !== this._group : true)),
    });

    this.params = this.fields.reduce((prev, cur) => {
      if (cur.prop && cur.value !== null) {
        prev[cur.prop] = cur.value;
      }

      return prev;
    }, {});

    this.current = 1;
    this._doFiltering();
    this._doPagination();
  }

  _doFocus() {
    if (!this._search) return;
    setTimeout(() => {
      const max = this._search.value.length;

      this._search.focus();
      this._search.setSelectionRange(max, max);
    }, 10);
  }

  _doFiltering() {
    this.keys = [];
    this.indexes.forEach((text, key) => {
      const props = Object.keys(this.params);

      for (let i = 0; i < props.length; i++) {
        const prop = props[i];

        if (this.params[prop] && this.params[prop] !== this.props.result[key][prop]) {
          return;
        }
      }

      if (this.search) {
        // FIXME: use more powerful search-method
        const words = this.search.split(RE_SPACE)
          .map(s => s.replace(RE_NWORD, '').trim())
          .filter(x => x);

        for (let i = 0; i < words.length; i++) {
          if (new RegExp(words[i], 'im').test(text)) {
            this.keys.push(key);
            break;
          }
        }
      } else {
        this.keys.push(key);
      }
    });

    if (this._sort || this._group) {
      this.keys.sort((a, b) => {
        const left = getProp(this.props.result[a], this._sort || this._group);
        const right = getProp(this.props.result[b], this._sort || this._group);

        let offset = 0;

        if (Array.isArray(left) && Array.isArray(right)) {
          offset = left.length - right.length;
        } else {
          if (!left || RE_NUM.test(left) || left < right) {
            offset = -1;
          }

          if (!right || RE_NUM.test(right) || left > right) {
            offset = 1;
          }
        }

        if (this._desc) {
          offset = offset * -1;
        }

        return offset;
      });
    }
  }

  _doPagination() {
    // FIXME: group data before... filtering or slice?
    const maxPages = Math.floor(this.keys.length / this.items);
    const offset = this.items * this.current;
    const groups = {};

    this.keys
      .slice(offset - this.items, offset)
      .forEach(key => {
        const value = merge({}, this.props.result[key]);
        const group = (this._group && getProp(this.props.result[key], this._group)) || 'default';

        if (!groups[group]) {
          groups[group] = [];
        }

        groups[group].push(value);
      });

    const fixedState = {
      data: groups,
      pages: maxPages,
      total: this.keys.length,
      items: this.items,
      search: this.search,
      current: this.current,
    };

    if (typeof this.state === 'undefined') {
      this.state = fixedState;
    } else {
      this.setState(fixedState);
    }
  }

  doPaginate(params) {
    Object.keys(params).forEach(key => {
      this[key] = parseInt(params[key], 10);
    });

    this._doPagination();
  }

  searchIn(value) {
    this.search = value;
    this._doFilter();
  }

  toggleOpts() {
    if (this._opts) {
      this._opts.classList.toggle('show');
      this._doFocus();
    }
  }

  openFrame(e, idx, group) {
    // FIXME: open inline editing here...
    // e.preventDefault();
  }

  sortBy(prop) {
    if (this._sort === prop) {
      if (this._desc) {
        this._asc = undefined;
        this._desc = undefined;
      } else if (this._asc) {
        this._asc = undefined;
        this._desc = true;
      } else {
        this._asc = true;
        this._desc = undefined;
      }
    } else {
      this._asc = true;
      this._desc = undefined;
    }

    this._sort = prop;
    this._doFilter();
  }

  renderItem(label) {
    return typeof label === 'string' && /^https?:\/\//.test(label)
      ? <a href={label} target="_blank">{label}</a>
      : label;
  }

  render() {
    const pages = [];

    for (let i = 0; i < this.state.pages; i++) {
      pages.push(i + 1);
    }

    const actionInfo = this.props.actions[this.props.schema.id];
    const newAction = actionInfo && (actionInfo.new
      ? linkTo(actionInfo.new.path)
      : null);

    const singleLabel = (this.props.refs[this.props.schema.id] || {}).singular || 'Object';
    const canAdd = !this.props.uiSchema['ui:actions'] || this.props.uiSchema['ui:actions'].indexOf('add') > -1;
    const ref = this.props.refs[this.props.model || options.schema.id] || {};

    return <div className="json-table-container">
      <h2 className="form-title">
      {(this.props.title || this.props.uiSchema.title)
        ? (this.props.title || this.props.uiSchema.title)
        : <span>Listing {ref.singular || 'Object'}</span>
      }
      </h2>
      <div className="json-table-filters no-select">
        <label className="has-icon">
          <span className="is-icon searchable" />
          <input
            type="search"
            ref={e => { this._search = e }}
            onInput={e => { this.searchIn(e.target.value); }}
            placeholder="Search"
           />
           {this.fields.length ? <a href="#" className={this.state.search ? 'filled' : ''} onClick={e => {
             e.preventDefault();
             this.toggleOpts();
           }}><span className="is-icon hideout" /></a> : null}
         </label>
           {canAdd && newAction
             ? <a href={newAction}><span className="is-icon adding" /></a>
             : null}
             {this.fields.length ? <div className="json-table-settings" ref={e => { this._opts = e }}>
                <ul className="reset">
                {this.fields.map((col, key) =>
                  <li key={key}>{col.enum
                    ? <span>
                        <label>
                          <input
                            type="checkbox"
                            checked={col.isShown !== false}
                            onChange={e => {
                              this._assign(key, 'isShown', e.target.checked);
                              this._doFocus();
                              this._doFilter();
                            }}
                          />
                          <span>{col.title || col.prop}</span>
                        </label>
                        <select value={col.selected} onChange={e => {
                          this._assign(key, 'value', e.target.value === 'ALL' ? null : e.target.value);
                          this._doFocus();
                          this._doFilter();
                        }}>
                          <option value={null}>ALL</option>
                          {col.enum.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      </span>
                    : <label>
                        <input
                          type="checkbox"
                          checked={col.isShown !== false}
                          onChange={e => {
                            this._assign(key, 'isShown', e.target.checked);
                            this._doFocus();
                            this._doFilter();
                          }}
                        />
                        <span>{col.title || col.prop}</span>
                      </label>}
                  </li>)}
                </ul>
                <hr />
                <label>
                  <span>Group by</span>
                  <select onChange={e => {
                    this._group = e.target.value;
                    this._doFocus();
                    this._doFilter();
                  }}>
                    <option value={null}>NONE</option>
                    {this.fields
                      .filter(x => typeof x.prop !== 'undefined' && x.filter !== false)
                      .map(col => <option key={col.prop} value={col.prop}>{col.title || col.prop}</option>)}
                  </select>
                </label>
             </div> : null}
      </div>
      {!this.fields.length ? <div>
          <p>Unsupported schema for <code>{this.props.model}</code>: <em>Missing fields</em>.</p>
          <pre>{JSON.stringify(this.props.schema, null, 2)}</pre>
        </div>
      : <table className="json-table responsive">
        <thead className="no-select"><tr>{this.fields.map((field, key) =>
          <th
            key={key}
            className={field.className}
            onClick={e => {
              if (!field.prop || this._group) return;
              this.sortBy(field.prop);
            }}
          >{field.title || field.prop} {field.prop && !this._group ? <em className={this._sort === field.prop ? 'active' : null}>
            <span className={this._sort === field.prop && this._asc ? 'active' : null}>◀</span>
            <span className={this._sort === field.prop && this._desc ? 'active' : null}>▶</span>
          </em> : null}</th>)}
          <th></th></tr>
        </thead>
        {Object.keys(this.state.data).map(group =>
          <tbody key={group}>
            {group !== 'default'
              ? <tr className="group" key={group}>
                  <th colSpan="99">{group} <span>{this.state.data[group].length}</span></th>
                </tr>
              : null}
            {this.state.data[group].map((row, key) =>
            <tr key={key} className="row">{this.fields.map((field, k) => {
              let label = ifDef(getProperty(row, field.template, this._el),
                getProp(row, field.getter),
                getProp(row, field.prop),
                '-');

              return <td
                key={`${key}_${field.prop || k}`}
                className={field.className}
                data-prop={field.title || field.prop}
              >{this.renderItem(label)}</td>;
            })}
              <td className="min-width no-select">
                {(!this.props.uiSchema['ui:actions'] || this.props.uiSchema['ui:actions'].indexOf('edit') > -1)
                  && this.props.actions[this.ref.model]
                  ? <a
                    href={linkTo(this.props.actions[this.ref.model].edit.path, row)}
                    onClick={e => this.openFrame(e, key, group)}
                    ><span className="is-icon editable" /></a>
                  : null}
              </td>
            </tr>)}
          </tbody>)}
      </table>}
      <div className="json-table-pagination no-select">
        <div>
          <select
            value={this.state.current}
            disabled={!this.state.pages}
            onChange={e => { this.doPaginate({ current: e.target.value }); }}
          >{pages.map(number => <option value={number} key={number}>{number}</option>)}
          </select>
          <button
            onClick={() => { this.doPaginate({ current: Math.max(0, this.state.current - 1) }); }}
            disabled={this.state.current === 1}
          >Prev</button>
          <button
            onClick={() => { this.doPaginate({ current: Math.min(this.state.pages, this.state.current + 1) }); }}
            disabled={this.state.current >= this.state.pages}
          >Next</button>
        </div>
        <div>
          <small>Page {this.current} {this.state.pages ? <span> / {this.state.pages}</span> : null}</small>
          <select
            value={this.state.items}
            onChange={e => { this.doPaginate({ current: 1, items: e.target.value, }); }}
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="30">30</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>;
  }
}

function initTable(el, options) {
  fixResource(options);

  ReactDOM.render(<div className="json-form">{React.createElement(ResourceTable, options)}</div>, el);
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
