<script>
  import { onMount, getContext, createEventDispatcher } from 'svelte';
  import { randId } from '../../../shared/utils';
  import { defaultValue } from '../utils';

  import Field from '..';
  import Value from '../../Value';
  import Modal from '../../Modal';

  export let name;
  export let through;
  export let association;
  export let path = [];
  export let uiSchema = {};
  export let schema = { type: 'array' };
  export let result = defaultValue(schema);

  const { actions, refs } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  // FIXME
  let addSub;

  let headers = [];
  let items = [];
  let keys = [];

  let nextValue = {};
  let nextProps = {};
  let nextOffset = 0;

  let isOpen = false;
  let isUpdate = false;
  let isFixed;

  function getItemBy(offset, subSchema) {
    const key = keys[offset] || (keys[offset] = randId());

    return {
      key,
      offset,
      schema: subSchema,
      uiSchema: isFixed ? uiSchema[offset] || {} : uiSchema,
      isFixed: isFixed && offset < schema.items.length,
      path: (path || []).concat(offset),
    };
  }

  function getSubSchema(offset) {
    return (Array.isArray(schema.items)
      ? schema.items[offset]
      : schema.items)
    || schema.additionalItems
    || {};
  }

  onMount(() => {
    isFixed = Array.isArray(schema.items);

    if (isFixed) {
      items = schema.items.map((_, offset) => getItemBy(offset, getSubSchema(offset)));
    } else {
      items = result.map((_, offset) => getItemBy(offset, schema.items || {}));
    }

    keys = items.map(x => x.key);
  });

  // FIXME: implement these methods to responds against API calls...
  function open() {
    // this method should open a inner modal with a search-bar, or inline form
    // to append a new resource based on its schema...
    console.log('open!', actions[through]);
    addSub = true;
  }

  function sync() { console.log('sync'); }
  function edit() { console.log('edit'); }
  function reset() { console.log('reset'); }

  function remove(key) {
    const offset = items.findIndex(x => x.key === key);

    keys = keys.filter((_, x) => x !== offset);
    result = result.filter((_, x) => x !== offset);
    items = items.filter((_, x) => x !== offset).map((sub, k) => ({ ...sub, offset: k }));
  }

  function append() {
    const newKey = randId();
    const offset = keys.length;
    const subSchema = getSubSchema(offset);

    keys = keys.concat(newKey);
    result = result.concat(defaultValue(subSchema));
    items = items.concat(getItemBy(offset, subSchema));
  }

  $: dispatch('change', result);
</script>

{#if items.length}
  {#if through}
    <table>
      <thead>
        <tr>
          {#each headers as { label }}
            <th>{label}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each items as { key, path, offset, isFixed, schema, uiSchema } (key)}
          <tr data-field={`/${path.join('/')}`}>
            {#each headers as { field }}
              <td data-field={`/${path.concat(field).join('/')}`}>
                <Value {schema} uiSchema={uiSchema[field]} value={result[offset][field]} />
              </td>
            {/each}
            <th>
              {#if !isFixed}
                {#if uiSchema['ui:edit'] !== false}
                  <button data-is="edit" data-before="&#9998;" type="button" on:click={() => edit(key)}>
                    <span>{uiSchema['ui:edit'] || `Edit ${association.singular}`}</span>
                  </button>
                {/if}
                {#if uiSchema['ui:remove'] !== false}
                  <button data-is="remove" data-before="&ndash;" type="button" on:click={() => remove(key)}>
                    <span>{uiSchema['ui:remove'] || `Remove ${association.singular}`}</span>
                  </button>
                {/if}
              {/if}
            </th>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <fieldset>
      <ul>
        {#each items as { key, path, offset, isFixed, schema, uiSchema } (key)}
          <li data-type={schema.type || 'object'}>
            {#if uiSchema['ui:template']}
              <Value {uiSchema} {schema} value={result[offset]} />
            {:else}
              <div data-field={`/${path.join('/')}`}>
                <div>
                  <Field {schema} {uiSchema} bind:result={result[offset]} name={`${name}[${offset}]`} />
                </div>
                {#if !isFixed && uiSchema['ui:remove'] !== false}
                  <div>
                    <button data-is="remove" data-before="&ndash;" type="button" on:click={() => remove(key)}>
                      <span>{uiSchema['ui:remove'] || 'Remove item'}</span>
                    </button>
                  </div>
                {/if}
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    </fieldset>
  {/if}
{:else}
  <div data-empty>{uiSchema['ui:empty'] || 'No items'}</div>
{/if}

{#if schema.additionalItems !== false}
  {#if uiSchema['ui:append'] !== false}
    <div>
      {#if through}
        <button data-is="append" type="button" on:click={open}>
          <span>{uiSchema['ui:append'] || `Add ${association.singular}`}</span>
        </button>
        <Modal {uiSchema} updating={isUpdate} resource={association.singular} bind:visible={isOpen} on:save={sync} on:close={reset}>
          <Field {...nextProps} {association} {through} bind:result={nextValue} name={`${name}[${nextOffset}]`} />
        </Modal>
      {:else}
        <button class="nobreak" data-is="append" data-before="&plus;" type="button" on:click={append}>
          <span>{uiSchema['ui:append'] || 'Add item'}</span>
        </button>
      {/if}
    </div>
  {/if}
{/if}

<Modal notitlebar bind:visible={addSub} on:cancel={() => { console.log('CANCEL') }} on:save={() => { console.log('SAVE') }}>
  <input type="number" required />
</Modal>
