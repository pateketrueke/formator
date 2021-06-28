<script>
  import { getContext } from 'svelte';

  export let type = 'string';
  export let name = null;
  export let label = null;
  export let format = null;
  export let required = null;
  export let password = null;
  export let autocomplete = null;

  const { schema, uiSchema } = getContext('__FORM__');

  if (name) {
    $schema.properties[name] = { type };

    if (format) $schema.properties[name].format = format;
    if (required && !$schema.required.includes(name)) $schema.required.push(name);
    if (!required && $schema.required.includes(name)) $schema.required = $schema.required.filter(x => x !== name);

    $uiSchema[name] = {};
    if (label) $uiSchema[name]['ui:label'] = label;
    if (password) $uiSchema[name]['ui:password'] = password;
    if (autocomplete) $uiSchema[name]['ui:autocomplete'] = autocomplete;
  }
</script>

{#if !name}
  <p data-empty>⚠ Missing prop <b>name</b> in: {JSON.stringify($$props, null, 2)}</p>
{/if}
