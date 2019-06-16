<script>
  import { getId } from '../../utils';

  export let name = 'number';
  export let result = 0;
  export let rootId = '?';

  $: id = getId(rootId, name);
</script>

<input type="number" bind:value={result} {id} {name} />
