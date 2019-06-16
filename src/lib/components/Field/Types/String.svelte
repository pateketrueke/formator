<script>
  import { getContext } from 'svelte';
  import { defaultValue, getId } from '../utils';

  export let name = 'string';
  export let schema = { type: 'string' };
  export let result = defaultValue(schema);

  const { rootId } = getContext('__ROOT__');

  $: id = getId(rootId, name);
</script>

<input type="text" bind:value={result} {id} {name} />
