<script>
  import { setContext } from 'svelte';
  import { defaultValue } from '../Field/utils';
  import { ACTION_MAP, randId, clean } from '../../shared/utils';

  import Field from '../Field';

  export let result = undefined;
  export let update = undefined;
  export let actions = null;
  export let name = null;

  export let refs = {};
  export let schema = {};
  export let uiSchema = {};

  $: currentAction = (schema.id && actions) ? actions[schema.id][action] : null;
  $: nextAction = (schema.id && actions) ? actions[schema.id][ACTION_MAP[action]] || {} : {};
  $: value = value || (typeof result === 'undefined' ? defaultValue(schema) : result);
  $: formProps = nextAction ? { method: 'post', action: nextAction.path || '' } : {};
  $: fieldProps = { props: { ...schema }, uiSchema };

  const rootId = randId();

  setContext('__ROOT__', {
    refs,
    rootId,
    actions,
    schema,
    uiSchema,
  });

  function save(e) {
    if (typeof update === 'function') {
      if (update(e, value) !== true) return;
    }

    e.preventDefault();
  }
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
