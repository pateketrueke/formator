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

export function DateElement(props, params) {
  const desc = props.uiSchema['ui:description'] || props.schema['ui:description'];
  const title = props.uiSchema['ui:title'] || props.schema['ui:title'] || props.name;

  return <div><div className="field-group field">
    <label
      htmlFor={props.idSchema.$id}
      className={['field-label'].concat(props.required ? 'is-required' : []).join(' ')}
    >{title}</label>
    <div className="field-control">{DateTime(props, params)}</div></div>
  {desc && <p className="field-description">{desc}</p>}
  </div>;
}

export function FieldTemplate(props) {
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

export function CheckBox(props) {
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
