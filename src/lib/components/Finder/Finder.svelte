<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import Failure from 'smoo/src/components/Failure.svelte';
  import Search from 'smoo/src/components/Search.svelte';

  import Value from '../Value';
  import { API } from '../../shared/utils';

  export let uiSchema = {};
  export let schema = {};
  export let name = null;
  export let id = null;

  const dispatch = createEventDispatcher();
  const { actions, refs } = getContext('__ROOT__');

  const fallback = uiSchema['ui:empty'] || 'No items were found';
  const placeholder = uiSchema['ui:placeholder'] || 'Find items...';

  let timeout;
  let data = [];
  let value = [];
  let result = null;
  let pending = null;

  function find(term) {
    const req = { ...actions[uiSchema['ui:ref']].index };

    if (term) {
      req.path += `?search=${term}`;
      pending = API.call(req).then(resp => {
        if (resp.status === 'ok') {
          data = resp.result;
        }
      });
    }
  }

  function sync(e) {
    result = null;
    pending = true;
    value = e.detail;
    dispatch('change', value[0]);
    setTimeout(() => {
      pending = null;
      result = data.find(x => x.id.toString() === value[0]);
    });
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

{#await pending}
  <div data-loading>{uiSchema['ui:loading'] || 'Loading results...'}</div>
{:then}
  {#if value.length > 0}
    <div data-selected>
      {#if result}
        <Value {schema} {uiSchema} value={result} />
      {:else}
        <div data-loading>{uiSchema['ui:loading'] || 'Loading results...'}</div>
      {/if}
      <input type="hidden" bind:value={value[0]} {id} {name} />
      <button type="button" on:click={reset} data-is="remove" data-before="&times;">
        <span>Remove item</span>
      </button>
    </div>
  {:else}
    <div data-empty>{uiSchema['ui:empty'] || 'No selection'}</div>
  {/if}
{:catch error}
  <Failure {error} />
{/await}
