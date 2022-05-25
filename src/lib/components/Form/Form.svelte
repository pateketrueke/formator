<script context="module">
  import { randId, defaultValue } from '../../shared/utils';

  // eslint-disable-next-line import/no-named-as-default, import/no-named-as-default-member
  import getField from '../../shared/field';
</script>

<script>
  import { onMount, setContext, createEventDispatcher } from 'svelte';

  let Field;
  getField().then(x => {
    Field = x;
  });

  export let refs = {};
  export let schema = {};
  export let uiSchema = {};

  export let name = null;
  export let model = null;
  export let action = null;
  export let actions = null;
  export let onsubmit = null;
  export let result = defaultValue(schema);

  const dispatch = createEventDispatcher();
  const rootId = randId();

  const ACTION_MAP = {
    new: 'create',
  };

  setContext('__ROOT__', {
    refs,
    rootId,
    actions,
    schema,
    uiSchema,
  });

  let el;

  function save(e) {
    if (typeof onsubmit === 'function') {
      if (onsubmit(e, result) !== true) return;
    }

    e.preventDefault();
    dispatch('submit', result);
  }

  onMount(() => {
    setTimeout(() => dispatch('change', { valid: null, result }));
  });

  $: dispatch('change', { valid: el && el.checkValidity(), result });
  $: hasChildren = schema.type === 'object' || schema.type === 'array';
  $: nextAction = (schema.id && actions[schema.id]) ? actions[schema.id][ACTION_MAP[action]] || {} : {};

  $: formProps = nextAction
    ? {
      method: 'post',
      action: nextAction.path || null,
      ...(!hasChildren ? { 'data-type': schema.type } : null),
    }
    : {};
</script>

{#if uiSchema['ui:title']}
  <div data-titlebar>
    <h3>{uiSchema['ui:title']}</h3>
  </div>
{/if}

<form on:submit={save} bind:this={el} {...formProps}>
  <slot name="before" />
  {#if !hasChildren}
    <div data-field="/">
      <svelte:component name={name || 'value'} bind:result this={Field} {model} {schema} {uiSchema} />
    </div>
  {:else}
    <svelte:component name={name || 'value'} bind:result this={Field} {model} {schema} {uiSchema} />
  {/if}
  {#if actions}
    <div>
      <button data-is="save" type="submit">
        <span>{uiSchema['ui:save'] || 'Save'}</span>
      </button>
      <input type="hidden" name="_method" value={nextAction.verb} />
    </div>
  {/if}
  <slot name="after" />
</form>
