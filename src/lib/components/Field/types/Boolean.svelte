<script context="module">
  import { defaultValue, getId } from '../../../shared/utils';
</script>

<script>
  import { getContext, createEventDispatcher } from 'svelte';

  export let name;
  export let required = false;
  export let uiSchema = {};
  export let schema = { type: 'boolean' };
  export let result = defaultValue(schema);

  const { rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  $: if (typeof result !== 'boolean') {
    result = Boolean(result);
  }

  $: id = getId(rootId, name);
  $: dispatch('change', result);
</script>

{#if uiSchema['ui:toggle']}
  <span class="toggle">
    <input type="checkbox" bind:checked={result} {id} {name} {required} />
    <label for={id}>
      <span />
    </label>
  </span>
{:else if uiSchema['ui:radio']}
  <span class="flex gap x2">
    <label>
      <input type="radio" {name} {required} bind:group={result} value={false} /> No
    </label>
    <label>
      <input type="radio" {name} {required} bind:group={result} value={true} /> Yes
    </label>
  </span>
{:else}
  <input type="checkbox" bind:checked={result} {id} {name} {required} />
{/if}
