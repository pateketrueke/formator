<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { defaultValue, getId } from '../../../shared/utils';

  export let name;
  export let required = false;
  export let schema = { type: 'boolean' };
  export let result = defaultValue(schema);

  const { rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  $: if (typeof result !== 'boolean') {
    result = false;
  }

  $: id = getId(rootId, name);
  $: dispatch('change', result);
</script>

<input type="checkbox" bind:checked={result} {id} {name} {required} />
