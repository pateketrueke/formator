<script context="module">
  import { defaultValue, getId } from '../../shared/utils';
</script>

<script>
  import { getContext, createEventDispatcher } from 'svelte';

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

  $: size = uiSchema['ui:size'] || null;
  $: id = getId(rootId, name);
  $: dispatch('change', result);
</script>

{#if uiSchema['ui:radio']}
  <span class="flex gap x2">
    {#each schema.enum as value}
      <label class="flex gap">
        <input type="radio" {name} {value} {required} bind:group={result} />
        <span>{value}</span>
      </label>
    {/each}
  </span>
{:else}
  <select bind:value={current} on:change={update} on:blur={update} {id} {name} {size} {required}>
    <option disabled selected value="">{uiSchema['ui:placeholder'] || 'Choose...'}</option>
    {#each schema.enum as value, idx (value)}
      <option value={idx}>{value}</option>
    {/each}
  </select>
{/if}
