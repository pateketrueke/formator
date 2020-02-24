<script>
  import { getContext, createEventDispatcher } from 'svelte';

  import { API } from '../../shared/utils';
  import Value from '../Value';

  export let id = null;
  export let name = null;
  export let schema = {};
  export let uiSchema = {};
  export let association = {};

  let t;
  let layer;
  let search;
  let current;
  let options;
  let items = [];
  let status = 'idle';
  let isOpen = false;
  let isClear = !current;

  const { actions, refs } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  function reset(e) {
    if (e.target === layer) isOpen = false;
  }

  function open() {
    if (!isOpen) isOpen = true;
  }

  function find() {
    const req = { ...actions[association.model].index };

    if (search && search.value) {
      req.path += `?search=${search.value}`
    }

    status = 'pending';

    API.call(req).then(data => {
      if (data.status === 'ok') {
        status = 'ready';
        items = data.result;
      }
    });
  }

  function input() {
    clearTimeout(t);
    t = setTimeout(find, 120);
  }

  function cancel(e) {
    if (e.keyCode === 27 && !isClear) e.stopPropagation();
  }

  function keydown(e) {
    isClear = e.target.value.length === 0;
  }

  function select(e) {
    current = e.target.dataset.value;
    isOpen = false;
  }

  $: if (isOpen) input();
  $: dispatch('change', current);
</script>

<div data-finder class={status}>
  <input {id}
    type="search"
    data-is="finder"
    bind:this={search}
    on:focus={open}
    on:input={input}
    on:keyup={cancel}
    on:keydown={keydown}
    placeholder="{uiSchema['ui:find'] || `Find ${association.singular}`}"
  />

  <input {name} type="hidden" value={current} />

  {#if status === 'ready' && !items.length}
    <small>{uiSchema['ui:empty'] || `${association.plural} were not found`}</small>
  {/if}

  {#if isOpen}
    <div bind:this={layer} on:click={reset} data-autocomplete>
      <ul bind:this={options} on:click={select}>
        {#each items as value (value)}
          <li data-value={value[schema.references.key]}>
            <Value {value} {uiSchema} schema={refs[schema.modelName]} />
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  {#if typeof current !== 'undefined' && current !== null}
    <small data-selected>{current}</small>
  {/if}
</div>
