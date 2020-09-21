<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { defaultValue, getId } from '../../../shared/utils';

  export let name;
  export let required = false;
  export let schema = { type: 'string' };
  export let result = defaultValue(schema);

  const { rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  $: if (typeof result !== 'string') {
    result = '';
  }

  $: id = getId(rootId, name);
  $: dispatch('change', result);
</script>

<input type="text" bind:value={result} {id} {name} {required} />
