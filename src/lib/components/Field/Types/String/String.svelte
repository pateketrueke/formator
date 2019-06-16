<script>
  import { getId } from '../../utils';

  export let name = 'string';
  export let result = '';
  export let rootId = '?';

  $: id = getId(rootId, name);
</script>

<input type="text" bind:value={result} {id} {name} />
