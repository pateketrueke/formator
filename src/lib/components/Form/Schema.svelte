<script>
  import { createEventDispatcher, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import Form from './Form.svelte';

  export let debug = false;

  const dispatch = createEventDispatcher();
  const uiSchema = writable({});
  const value = writable({});
  const schema = writable({
    type: 'object',
    required: [],
    properties: {},
    additionalProperties: false,
  });

  setContext('__FORM__', {
    value,
    schema,
    uiSchema,
  });

  function update(e) {
    value.set(e.detail);
    dispatch('submit', e.detail);
  }

  function validate(e) {
    dispatch('change', e.detail);
  }
</script>

<slot />

<Form result={$value} schema={$schema} uiSchema={$uiSchema} on:submit={update} on:change={validate}>
  <div slot="after" data-actions>
    <slot name="actions">
      <button type="submit">Save</button>
    </slot>
  </div>
</Form>

{#if debug}
  <details>
    <pre>{JSON.stringify({ $value, $schema, $uiSchema }, null, 2)}</pre>
  </details>
{/if}
