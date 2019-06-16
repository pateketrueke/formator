<script>
  import { getId } from '../../utils';

  export let name = 'boolean';
  export let result = false;
  export let rootId = '?';

  $: id = getId(rootId, name);
</script>

<input type="checkbox" bind:checked={result} {id} {name} />
