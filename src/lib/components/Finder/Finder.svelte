<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import Search from 'smoo/src/components/Search.svelte';

  import Value from '../Value';
  import { API } from '../../shared/utils';

  export let uiSchema = {};
  export let schema = {};

  const dispatch = createEventDispatcher();
  const { actions, refs } = getContext('__ROOT__');

  const fallback = uiSchema['ui:empty'] || 'No items were found';
  const placeholder = uiSchema['ui:placeholder'] || 'Find items...';

  let timeout;
  let data = [];
  let value = [];
  let result = null;

  function find(term) {
    const req = { ...actions[uiSchema['ui:ref']].index };

    if (term) {
      req.path += `?search=${term}`;

      API.call(req).then(resp => {
        if (resp.status === 'ok') {
          data = resp.result;
        }
      });
    }
  }

  function sync(e) {
    value = e.detail;
    result = data.find(x => x.id.toString() === value[0]);
    dispatch('change', value[0]);
  }

  function reset() {
    value = [];
    result = null;
  }

  function search(e) {
    if (!e.detail) {
      data = [];
      return;
    }

    clearTimeout(timeout);
    timeout = setTimeout(() => {
      find(e.detail);
    }, 260);
  }
</script>

<Search {data} {fallback} {placeholder} on:input={search} on:change={sync} bind:value nofilter autoclose>
  <svg slot="before" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
    <path fill-rule="evenodd" d="M14.53 15.59a8.25 8.25 0 111.06-1.06l5.69 5.69a.75.75 0 11-1.06 1.06l-5.69-5.69zM2.5 9.25a6.75 6.75 0 1111.74 4.547.746.746 0 00-.443.442A6.75 6.75 0 012.5 9.25z"></path>
  </svg>
</Search>

{#if value.length > 0}
  <div data-selected>
    {#if result}
      <Value {schema} uiSchema={uiSchema} value={result} />
    {:else}
      <span>{value[0]}</span>
    {/if}
    <button type="button" on:click={reset}>&times;</button>
  </div>
{/if}
