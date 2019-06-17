<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { defaultValue, getId } from '../utils';

  export let name = 'boolean';
  export let schema = { type: 'boolean' };
  export let result = defaultValue(schema);

  const { rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  $: id = getId(rootId, name);
  $: dispatch('change', result);
</script>

<input type="checkbox" bind:checked={result} {id} {name} />
