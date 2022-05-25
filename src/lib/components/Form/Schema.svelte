<script>
  import { createEventDispatcher, setContext } from 'svelte';
  import { writable } from 'svelte/store';
  import Form from './Form.svelte';

  export let debug = false;
  export let title = null;
  export let noclose = false;
  export let validate = null;

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

  function validation() {
    if (typeof validate !== 'function') return true;
    return validate($value, $schema, $uiSchema);
  }

  function update(e) {
    if (!validation()) return;
    value.set(e.detail);
    dispatch('submit', e.detail);
  }

  function check(e) {
    if (!validation()) return;
    dispatch('change', e.detail);
  }

  function close() {
    dispatch('close');
  }

  $: payload = { $value, $schema, $uiSchema };
</script>

{#if title}
  <div data-titlebar class="flex gap">
    <h3 class="auto chunk">{title}</h3>
    {#if !noclose}
      <button data-cancel tabindex="-1" type="button" on:click={close}>&times;</button>
    {/if}
  </div>
{/if}

<slot />

<Form result={$value} schema={$schema} uiSchema={$uiSchema} on:submit={update} on:change={check}>
  <div slot="after" data-actions class="flex fill wrap gap x2">
    <slot name="actions">
      <button type="submit">Save</button>
    </slot>
  </div>
</Form>

{#if debug}
  <details>
    <pre>{JSON.stringify(payload, null, 2)}</pre>
  </details>
{/if}
