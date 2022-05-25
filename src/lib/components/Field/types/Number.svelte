<script context="module">
  import { defaultValue, getId } from '../../../shared/utils';
</script>

<script>
  import { getContext, createEventDispatcher } from 'svelte';

  export let name;
  export let required = false;
  export let schema = { type: 'number' };
  export let result = defaultValue(schema);

  const { rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  $: if (typeof result !== 'number') {
    result = 0;
  }

  $: id = getId(rootId, name);
  $: step = schema.multipleOf || 0.1;
  $: dispatch('change', result);
</script>

<input {step} type="number" bind:value={result} {id} {name} {required} />
