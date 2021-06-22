<script>
  import { onMount, setContext, createEventDispatcher } from 'svelte';
  import { randId, defaultValue } from '../../shared/utils';

  import Field from '../Field';

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

  onMount(() => {
    setTimeout(() => dispatch('change', result));
  });

  function save(e) {
    if (typeof onsubmit === 'function') {
      if (onsubmit(e, result) !== true) return;
    }

    e.preventDefault();
    dispatch('change', result);
  }

  $: dispatch('change', result);

  $: hasChildren = schema.type === 'object' || schema.type === 'array';
  $: nextAction = (schema.id && actions[schema.id]) ? actions[schema.id][ACTION_MAP[action]] || {} : {};

  $: formProps = nextAction
    ? {
      method: 'post',
      action: nextAction.path || '',
      ...(!hasChildren ? { 'data-type': schema.type } : null),
    }
    : {};
</script>

{#if uiSchema['ui:title']}
  <h2>{uiSchema['ui:title']}</h2>
{/if}

<form on:submit={save} {...formProps}>
  {#if !hasChildren}
    <div data-field="/">
      <Field name={name || 'value'} bind:result {model} {schema} {uiSchema} />
    </div>
  {:else}
    <Field name={name || 'value'} bind:result {model} {schema} {uiSchema} />
  {/if}
  {#if actions}
    <div>
      <button data-is="save" type="submit">
        <span>{uiSchema['ui:save'] || 'Save'}</span>
      </button>
      <input type="hidden" name="_method" value={nextAction.verb} />
    </div>
  {/if}
</form>
