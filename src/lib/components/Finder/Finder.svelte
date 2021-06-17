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

<Search {data} {fallback} {placeholder} on:input={search} on:change={sync} bind:value nofilter autoclose />

{#if value.length > 0}
  <div data-selected>
    {#if result}
      <Value {schema} {uiSchema} value={result} />
    {:else}
      <span>{value[0]}</span>
    {/if}
    <button type="button" on:click={reset} data-is="remove" data-before="&times;">
      <span>Remove item</span>
    </button>
  </div>
{/if}
