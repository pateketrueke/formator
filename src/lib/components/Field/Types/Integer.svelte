<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { defaultValue, getId } from '../utils';

  export let name = undefined;
  export let schema = { type: 'integer' };
  export let result = defaultValue(schema);

  const { rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  $: id = getId(rootId, name);
  $: step = schema.multipleOf || 1;
  $: dispatch('change', result);
</script>

<input {step} type="number" bind:value={result} {id} {name} />
