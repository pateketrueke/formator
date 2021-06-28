<script>
  import { writable } from 'svelte/store';
  import { setContext } from 'svelte';
  import Form from './Form.svelte';

  export let debug = false;

  const value = writable(null);

  const schema = writable({
    type: 'object',
    required: [],
    properties: {},
    additionalProperties: false,
  });

  const uiSchema = writable({});

  setContext('__FORM__', {
    value,
    schema,
    uiSchema,
  });

  function update(e) {
    value.set(e.detail);
  }
</script>

<slot />

<div class="formator">
  <Form schema={$schema} uiSchema={$uiSchema} on:submit={update}>
    <div slot="after" data-actions>
      <button type="submit">Save</button>
    </div>
  </Form>
</div>

{#if debug}
  <details>
    <pre>{JSON.stringify({ $value, $schema, $uiSchema }, null, 2)}</pre>
  </details>
{/if}
