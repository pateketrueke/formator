<script>
  import { getContext } from 'svelte';
  import { defaultValue, getId } from '../utils';

  export let name = 'number';
  export let schema = { type: 'number' };
  export let result = defaultValue(schema);

  const { rootId } = getContext('__ROOT__');

  $: id = getId(rootId, name);
</script>

<input type="number" bind:value={result} {id} {name} />
