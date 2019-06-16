<script>
  import { getContext } from 'svelte';
  import { getId } from '../utils';

  export let name = 'boolean';
  export let schema = { type: 'boolean' };
  export let result = defaultValue(schema);

  const { rootId } = getContext('__ROOT__');

  $: id = getId(rootId, name);
</script>

<input type="checkbox" bind:checked={result} {id} {name} />
