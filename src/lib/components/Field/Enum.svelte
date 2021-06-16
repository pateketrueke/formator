<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { defaultValue, getId } from '../../shared/utils';

  export let name;
  export let required = false;
  export let uiSchema = {};
  export let schema = { enum: [] };
  export let result = defaultValue(schema);

  const { rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  let current = schema.enum.indexOf(result);
  function update() {
    result = schema.enum[current];
  }

  $: id = getId(rootId, name);
  $: dispatch('change', result);
</script>

<select bind:value={current} on:change={update} on:blur={update} {id} {name} {required}>
  <option disabled selected value="">{uiSchema['ui:placeholder'] || 'Choose...'}</option>
  {#each schema.enum as value, idx (value)}
    <option value={idx}>{value}</option>
  {/each}
</select>
