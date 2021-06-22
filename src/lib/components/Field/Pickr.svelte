<script>
  import {
    getContext, createEventDispatcher, onMount, onDestroy,
  } from 'svelte';
  import flatpickr from 'flatpickr';

  import { defaultValue, getId } from '../../shared/utils';

  export let name;
  export let required = false;
  export let schema = { type: 'number' };
  export let result = defaultValue(schema);

  const { rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  let pickr;
  let ref;
  onMount(() => {
    pickr = flatpickr(ref, {
      // FIXME: support for more options...
      onValueUpdate: (selectedDates, dateStr) => {
        result = dateStr;
      },
    });
  });
  onDestroy(() => {
    pickr.destroy();
  });

  $: id = getId(rootId, name);
  $: dispatch('change', result);
</script>

<input bind:this={ref} {id} {name} {required} />
