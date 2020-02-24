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
  let options;
  let offset = -1;
  let current = {};
  let items = [];
  let status = 'idle';
  let isOpen = false;
  let isClear = true;

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
      req.path += `?search=${search.value}`;
    }

    status = 'pending';

    API.call(req).then(data => {
      if (data.status === 'ok') {
        status = 'ready';
        items = data.result;
      }
    });
  }

  function clear() {
    offset = -1;
    current = {};
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

    if (e.keyCode === 38) {
      offset = Math.max(0, offset - 1);
    }

    if (e.keyCode === 40) {
      offset = Math.min(items.length - 1, offset + 1);
    }

    if (offset >= 0 && e.keyCode === 13) {
      current = items[offset];
      e.preventDefault();
    }
  }

  function select(e) {
    for (let i = 0, c = options.children.length; i < c; i++) {
      if (options.children[i] === e.target) {
        current = items[i];
        offset = i;
        break;
      }
    }
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

  <input {name} type="hidden" value={current[schema.references.key]} />

  {#if status === 'ready' && !items.length}
    <small>{uiSchema['ui:empty'] || `${association.plural} were not found`}</small>
  {/if}

  {#if isOpen}
    <div bind:this={layer} on:click={reset} data-autocomplete>
      <ul bind:this={options} on:click={select}>
        {#each items as value, k (value)}
          <li class:active={k === offset} data-value={value[schema.references.key]}>
            <Value {value} {uiSchema} schema={refs[schema.modelName]} />
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  {#if typeof current[schema.references.key] !== 'undefined'}
    <small data-selected on:click={clear}>{current[schema.references.key]}</small>
  {/if}
</div>
