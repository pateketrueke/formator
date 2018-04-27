import {
  getText,
  linkTo,
  merge,
  ifDef,
  getProp,
  getProperty } from './helpers';

import { LAYERS } from './constants';

export default class ResourceTable extends React.Component {
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
      if (this._opts.classList.contains('show')) {
        LAYERS.splice(this._offset, 1);
      } else {
        this._offset = LAYERS.push(() => {
          this._opts.classList.remove('show');
        });
      }

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
