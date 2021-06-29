<script>
  import { getContext } from 'svelte';

  export let type = 'string';
  export let name = null;
  export let hint = null;
  export let cols = null;
  export let ros = null;
  export let size = null;
  export let title = null;
  export let label = null;
  export let format = null;
  export let toggle = null;
  export let hidden = null;
  export let columns = null;
  export let textarea = null;
  export let password = null;
  export let required = null;
  export let multiple = null;
  export let template = null;
  export let maxlength = null;
  export let autocomplete = null;

  let className;
  export { className as class };

  let defaultValue;
  export { defaultValue as value };

  const { value, schema, uiSchema } = getContext('__FORM__');

  if (name) {
    $schema.properties[name] = { type };

    if (format) $schema.properties[name].format = format;
    if (required && !$schema.required.includes(name)) $schema.required.push(name);
    if (!required && $schema.required.includes(name)) $schema.required = $schema.required.filter(x => x !== name);

    $value[name] = defaultValue;
    $uiSchema[name] = {};

    if (className) $uiSchema[name]['ui:class'] = className;
    if (hint) $uiSchema[name]['ui:hint'] = hint;
    if (cols) $uiSchema[name]['ui:cols'] = cols;
    if (ros) $uiSchema[name]['ui:ros'] = ros;
    if (size) $uiSchema[name]['ui:size'] = size;
    if (title) $uiSchema[name]['ui:title'] = title;
    if (label) $uiSchema[name]['ui:label'] = label;
    if (format) $uiSchema[name]['ui:format'] = format;
    if (toggle) $uiSchema[name]['ui:toggle'] = toggle;
    if (hidden) $uiSchema[name]['ui:hidden'] = hidden;
    if (columns) $uiSchema[name]['ui:columns'] = columns;
    if (textarea) $uiSchema[name]['ui:textarea'] = textarea;
    if (password) $uiSchema[name]['ui:password'] = password;
    if (required) $uiSchema[name]['ui:required'] = required;
    if (multiple) $uiSchema[name]['ui:multiple'] = multiple;
    if (template) $uiSchema[name]['ui:template'] = template;
    if (maxlength) $uiSchema[name]['ui:maxlength'] = maxlength;
    if (autocomplete) $uiSchema[name]['ui:autocomplete'] = autocomplete;
  }
</script>

{#if !name}
  <p data-empty>⚠ Missing prop <b>name</b> in: {JSON.stringify($$props, null, 2)}</p>
{/if}
