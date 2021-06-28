<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { defaultValue, getId } from '../../../shared/utils';

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
{:else}
  <input type="checkbox" bind:checked={result} {id} {name} {required} />
{/if}
