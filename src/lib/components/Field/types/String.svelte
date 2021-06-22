<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { getId, defaultValue, inputType } from '../../../shared/utils';

  export let name;
  export let required = false;
  export let uiSchema = {};
  export let schema = { type: 'string' };
  export let result = defaultValue(schema);

  const { rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  function update(e) {
    result = e.target.value;
  }

  $: if (typeof result !== 'string') {
    result = '';
  }

  $: autocomplete = uiSchema['ui:autocomplete'];
  $: type = inputType(schema);
  $: id = getId(rootId, name);
  $: dispatch('change', result);
</script>

{#if uiSchema['ui:password']}
  <input type="password" on:change={update} {id} {name} {required} {autocomplete} />
{:else}
  <input {type} value={result} on:input={update} {id} {name} {required} {autocomplete} />
{/if}
