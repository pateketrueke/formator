<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { defaultValue, getId } from '../utils';

  export let name = 'number';
  export let schema = { type: 'number' };
  export let result = defaultValue(schema);

  const { rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  $: id = getId(rootId, name);
  $: dispatch('change', result);
</script>

<input type="number" bind:value={result} {id} {name} />
