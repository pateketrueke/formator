<script>
  import { onMount, setContext, createEventDispatcher } from 'svelte';
  import { Failure } from 'svql';

  import Modal from '../Modal';
  import Field from '../Field';
  import Value from '../Value';

  import { defaultValue } from '../Field/utils';
  import { API, randId } from '../../shared/utils';

  export let actions = {};
  export let result = [];
  export let refs = {};
  export let model;

  export let uiSchema = {};
  export let schema = {};
  export let value = {};

  export let association = {
    singular: 'Item',
    plural: 'Items',
  };

  const dispatch = createEventDispatcher();
  const rootId = randId();

  setContext('__ROOT__', {
    refs,
    rootId,
    actions,
    schema,
    uiSchema,
  });

  let offset = -1;
  let isUpdate = false;
  let isOpen = false;
  let payload = result.length !== 0;

  function getItems() {
    return result.map((x, k) => ({
      key: k,
      path: [],
      offset: k,
      schema: schema.properties || {},
    }));
  }

  function getHeaders() {
    let props;

    if (uiSchema['ui:fields']) {
      props = uiSchema['ui:fields'];
    } else {
      props = schema.properties
        ? Object.keys(schema.properties)
        : [];
    }

    return props
      .filter(x => (uiSchema[x] ? !uiSchema[x]['ui:hidden'] : true))
      .map((key, i) => ({
        label: (uiSchema['ui:headers'] && uiSchema['ui:headers'][i])
          || (uiSchema[key] && uiSchema[key]['ui:label'])
          || key,
        field: key,
      }));
  }

  function edit(newOffset) {
    isOpen = true;
    offset = newOffset;
    value = offset >= 0 ? result[offset] : defaultValue(schema);
  }

  function reload() {
    payload = API.call(actions[model].index).then(resp => {
      result = resp.result;
    });
  }

  function remove(offset) {
    result = result.filter((_, k) => k !== offset);
    items = getItems();
  }

  function sync() {
    if (typeof offset === 'undefined') {
      result = result.concat(value);
    }

    dispatch('change', result);

    items = getItems();
    isOpen = false;
  }

  onMount(() => {
    if (actions[model] && !payload) reload();

    setTimeout(() => {
      dispatch('change', result);
    });
  });

  $: items = getItems();
  $: headers = getHeaders();
  $: fieldProps = { model, schema, uiSchema };
</script>

<table>
  {#if uiSchema['ui:title']}
    <caption>{uiSchema['ui:title']}</caption>
  {/if}

  {#if headers.length}
    <thead>
      <tr>
        {#each headers as { label }}
          <th>{label}</th>
        {/each}
        <th></th>
      </tr>
    </thead>
  {/if}

  <tbody data-field="/" data-type="array">
    {#if payload}
      {#await payload}
        <tr>
          <td colspan="99">Loading data...</td>
        </tr>
      {:then}
        {#each items as { key, path, offset, schema } (key)}
          <tr data-field={`/${path.concat(key).join('/')}`} data-type={schema.type || 'object'}>
            {#if uiSchema['ui:template']}
              <td>
                <Value {schema} {uiSchema} value={result[offset]} />
              </td>
            {:else}
              {#each headers as { field }}
                <td data-field={`/${path.concat(key, field).join('/')}`} data-type={(schema[field] && schema[field].type) || 'object'}>
                  <Value {schema} uiSchema={uiSchema[field]} value={result[offset][field]} />
                </td>
              {/each}
            {/if}
            <th>
              {#if uiSchema['ui:edit'] !== false}
                <button data-is="edit" data-before="&#9998;" type="button" on:click={() => edit(offset)}>
                  <span>{uiSchema['ui:edit'] || 'Edit'}</span>
                </button>
              {/if}
              {#if uiSchema['ui:remove'] !== false}
                <button data-is="remove" data-before="&times;" type="button" on:click={() => remove(offset)}>
                  <span>{uiSchema['ui:remove'] || 'Remove'}</span>
                </button>
              {/if}
            </th>
          </tr>
        {:else}
          <tr>
            <td colspan="99" data-empty>{uiSchema['ui:empty'] || 'No items'}</td>
          </tr>
        {/each}
      {:catch error}
        <tr>
          <td colspan="99">
            <Failure {error} />
            <button data-is="reload" on:click={reload}>Try again</button>
          </td>
        </tr>
      {/await}
    {/if}
  </tbody>

  {#if uiSchema['ui:new'] !== false}
    <tfoot>
      <tr>
        <td colspan="99">
          <button data-is="new" type="submit" on:click={() => edit()}>
            <span>{uiSchema['ui:new'] || `New ${association.singular}`}</span>
          </button>
        </td>
      </tr>
    </tfoot>
  {/if}
</table>

<Modal {uiSchema} updating={isUpdate} resource={model} bind:visible={isOpen} on:save={sync}>
  <Field name="__ROOT__" bind:result={value} {...fieldProps} />
</Modal>
