<script>
  import { onMount, setContext, createEventDispatcher } from 'svelte';
  import { defaultValue } from '../Field/utils';
  import { ACTION_MAP, randId, clean } from '../../shared/utils';

  import Field from '../Field';

  export let result = undefined;
  export let onsubmit = undefined;
  export let actions = null;
  export let name = null;

  export let refs = {};
  export let schema = {};
  export let uiSchema = {};

  const dispatch = createEventDispatcher();
  const rootId = randId();

  $: currentAction = (schema.id && actions) ? actions[schema.id][action] : null;
  $: nextAction = (schema.id && actions) ? actions[schema.id][ACTION_MAP[action]] || {} : {};
  $: value = value || (typeof result === 'undefined' ? defaultValue(schema) : result);
  $: formProps = nextAction ? { method: 'post', action: nextAction.path || '' } : {};
  $: fieldProps = { props: { ...schema }, uiSchema };

  setContext('__ROOT__', {
    refs,
    rootId,
    actions,
    schema,
    uiSchema,
  });

  onMount(() => {
    setTimeout(() => dispatch('change', value));
  });

  function save(e) {
    if (typeof onsubmit === 'function') {
      if (onsubmit(e, value) !== true) return;
    }

    e.preventDefault();
    dispatch('change', value);
  }

  $: dispatch('change', value);
</script>

<slot>
  {#if uiSchema['ui:title']}
    <h2>{uiSchema['ui:title']}</h2>
  {/if}
  <form on:submit={save} {...formProps}>
    <Field name={name || 'value'} bind:result={value} {...fieldProps} />
    {#if actions}
      <div>
        <button data-is="save" type="submit">
          <span>{uiSchema['ui:save'] || 'Save'}</span>
        </button>
        <input type="hidden" name="_method" value={nextAction.verb} />
      </div>
    {/if}
  </form>
</slot>
