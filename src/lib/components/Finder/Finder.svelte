<script>//
  import { getContext, createEventDispatcher } from 'svelte';

  import Value from '../Value';
  import { API } from '../../shared/utils';

  export let id = null;
  export let name = null;

  export let schema = {};
  export let uiSchema = {};

  let t;
  let layer;
  let search;
  // let current;
  let options;
  let offset = -1;
  let data = {};
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
    const req = { ...actions[uiSchema['ui:ref']].index };

    if (search && search.value) {
      req.path += `?search=${search.value}`;
    }

    status = 'pending';

    API.call(req).then(resp => {
      if (resp.status === 'ok') {
        status = 'ready';
        items = resp.result || [];
        offset = Math.max(0, Math.min(offset, items.length - 1));
      }
    });
  }

  function clear() {
    offset = -1;
    data = {};
  }

  function input() {
    clearTimeout(t);
    t = setTimeout(find, 120);
  }

  function keydown(e) {
    if (e.keyCode === 27 && isOpen) {
      e.stopPropagation();
      isOpen = false;
      return;
    }

    if (e.keyCode === 38) {
      e.preventDefault();
      if (!isOpen) isOpen = true;
      else offset = Math.max(0, offset - 1);
    }

    if (e.keyCode === 40) {
      e.preventDefault();
      if (!isOpen) isOpen = true;
      else offset = Math.min(items.length - 1, offset + 1);
    }

    if (e.keyCode === 9) {
      isOpen = false;
    }

    if (offset >= 0 && e.keyCode === 13) {
      if (isOpen) e.preventDefault();
      data = items[offset];
      isOpen = false;
    }

    isClear = e.target.value.length === 0 && !isOpen;
  }

  function select(e) {
    for (let i = 0, c = options.children.length; i < c; i += 1) {
      if (options.children[i] === e.target) {
        data = items[i];
        offset = i;
        break;
      }
    }
    isOpen = false;
  }

  $: if (isOpen) input();
  $: dispatch('change', data);

  // FIXME: recover from passed values...
  // $: console.log({data,current});
</script>

<div data-finder class={status}>
  <input {id}
    type="search"
    data-is="finder"
    bind:this={search}
    on:focus={open}
    on:input={input}
    on:keydown={keydown}
    placeholder="{uiSchema['ui:placeholder'] || `Find ${uiSchema['ui:ref']}`}"
  />

  <!-- <input {name} type="hidden" value={data[schema.references.key]} /> -->

  {#if !items.length}
    <small>{uiSchema['ui:empty'] || 'No items were found'}</small>
  {/if}

  {#if isOpen && items.length > 0}
    <div bind:this={layer} on:click={reset} data-autocomplete>
      <ul bind:this={options} on:click={select}>
        {#each items as value, k (value)}
          <li class:selected={k === offset}>
            <Value {value} {uiSchema} schema={refs[uiSchema['ui:ref']]} />
          </li>
        {/each}
      </ul>
    </div>
  {/if}

  <!-- {#if typeof data[schema.references.key] !== 'undefined'}
    <small data-selected on:click={clear}>{data[schema.references.key]}</small>
  {/if} -->
</div>
