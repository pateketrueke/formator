<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { randId, getItems, fixedCols, defaultValue } from '../../../shared/utils';

  import Field from '..';
  import Value from '../../Value';
  import Modal from '../../Modal';

  export let name;
  export let model;
  export let through;
  export let association;
  export let path = [];
  export let value = null;
  export let parent = null;
  export let required = false;
  export let uiSchema = {};
  export let schema = { type: 'array' };
  export let result = defaultValue(schema);

  const { refs } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  let headers = [];
  let items = [];
  let keys = [];

  let backup = [];
  let isFixed;
  let isOpen = false;
  let isUpdate = false;

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

  // FIXME: implement these methods to responds against API calls...
  function open() {
    if (!Array.isArray(value)) value = [];

    backup = [...value];
    isOpen = true;
  }

  function sync() {
    result = result.concat(value);
  }

  function edit() {
    console.log('edit');
  }

  function reset() {
    value = backup;
  }

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

  $: if (!Array.isArray(result)) {
    result = [];
  }

  $: {
    if (isFixed) {
      items = schema.items.map((_, offset) => getItemBy(offset, getSubSchema(offset)));
    } else {
      items = result.map((_, offset) => getItemBy(offset, schema.items || {}));
    }

    const propSchema = getItems(schema, 0) || refs[through] || schema[name] || {};
    const props = uiSchema['ui:fields'] || (propSchema.properties
      ? Object.keys(propSchema.properties)
      : []);

    headers = props
      .filter(x => (uiSchema[x] ? !uiSchema[x]['ui:hidden'] : true))
      .map(key => ({
        label: (uiSchema['ui:headers'] && uiSchema['ui:headers'][key]) || key,
        field: key,
      }));

    keys = items.map(x => x.key);
  }

  $: isFixed = Array.isArray(schema.items);
  $: dispatch('change', result);
</script>

{#if items.length}
  {#if through}
    <table>
      <thead>
        <tr>
          {#each headers as { field, label }}
            <th class={fixedCols(uiSchema[field], headers)}>{label}</th>
          {/each}
          <th colspan="99"></th>
        </tr>
      </thead>
      <tbody>
        {#each items as { key, path, offset, isFixed, schema, uiSchema } (key)}
          <tr data-field="/{path.join('/')}">
            {#each headers as { field, label }}
              <td data-field="/{path.concat(field).join('/')}" data-label={label} class={fixedCols(uiSchema[field], headers)}>
                <Value {schema} uiSchema={uiSchema[field]} value={result[offset][field]} />
              </td>
            {/each}
            <th>
              {#if !isFixed}
                {#if uiSchema['ui:edit'] !== false}
                  <button data-is="edit" data-before="&#9998;" type="button" on:click={() => edit(key)}>
                    <span>{uiSchema['ui:edit'] || 'Edit'}</span>
                  </button>
                {/if}
                {#if uiSchema['ui:remove'] !== false}
                  <button data-is="remove" data-before="&times;" type="button" on:click={() => remove(key)}>
                    <span>{uiSchema['ui:remove'] || 'Remove'}</span>
                  </button>
                {/if}
              {/if}
            </th>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <ul class="v-flex fill gap x2">
      {#each items as { key, path, offset, isFixed, schema, uiSchema } (key)}
        <li data-type={schema.type || 'object'}>
          {#if uiSchema['ui:template']}
            <Value {uiSchema} {schema} value={result[offset]} />
          {:else}
            <div data-field="/{path.join('/')}">
              <div data-value class="v-flex gap">
                <Field {schema} {uiSchema} bind:result={result[offset]} name="{name}[{offset}]" />
                {#if !isFixed && uiSchema['ui:remove'] !== false}
                  <button data-is="remove" data-before="&minus;" type="button" on:click={() => remove(key)}>
                    <span>{uiSchema['ui:remove'] || 'Remove item'}</span>
                  </button>
                {/if}
              </div>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}
{:else}
  <div data-empty>{uiSchema['ui:empty'] || 'No items'}</div>
  {#if required}
    <input type="hidden" tabIndex="-1" on:input="{e => { e.target.value = ''; }}" {name} {required} />
  {/if}
{/if}

{#if schema.additionalItems !== false && uiSchema['ui:push'] !== false}
  <div data-actions class="flex fill wrap gap x2">
    {#if through}
      <button class="nobreak" data-is="append" data-before="&plus;" type="button" on:click={open}>
        <span>{uiSchema['ui:push'] || `Add ${association.singular}`}</span>
      </button>
    {:else}
      <button class="nobreak" data-is="append" data-before="&plus;" type="button" on:click={append}>
        <span>{uiSchema['ui:push'] || 'Add item'}</span>
      </button>
    {/if}
  </div>
{/if}

<Modal updating={isUpdate} resource={association.singular} bind:visible={isOpen} on:cancel={reset} on:save={sync}>
  <Field name="{name}[{items.length}]" bind:result={value} schema={refs[through]} {uiSchema} {association} {model} {parent} {through} />
</Modal>
