<script>
  import { getContext } from 'svelte';

  import Value from '../Value';

  // export let name = null;
  // export let field = null;
  // export let model = null;

  // export let through = null;
  export let current = null;

  export let schema = {};
  export let uiSchema = {};
  export let association = {};

  let options;
  let items = [];
  let status = '';
  let isOpen = false;
  let isClear = !current;

  const { actions, refs } = getContext('__ROOT__');

  function open() { console.log('open'); }
  function close() { console.log('close'); }

  function input(e) {
    console.log(actions[schema.modelName]);
  }

  function cancel(e) {
    if (e.keyCode === 27 && !isClear) e.stopPropagation();
  }

  function keydown(e) {
    isClear = e.target.value.length === 0;
  }

  function select() { console.log('select'); }
</script>

<div data-finder class={status}>
  <input
    type="search"
    data-is="finder"
    on:focus={open}
    on:blur={close}
    on:input={input}
    on:keyup={cancel}
    on:keydown={keydown}
    placeholder="{uiSchema['ui:find'] || `Find ${association.singular}`}"
  />
  {#if status === 'ready' && !items.length}
    <small>{uiSchema['ui:empty'] || `${association.plural} were not found`}</small>
  {/if}
  {#if isOpen}
    <div data-autocomplete>
      <ul bind:this={options} on:click={select}>
        {#each items as value (value)}
          <li><Value {value} {schema} {uiSchema} /></li>
        {/each}
      </ul>
    </div>
  {/if}
  <div data-separator>
    <span>{uiSchema['ui:details'] || `${association.singular} details`}</span>
  </div>
</div>
