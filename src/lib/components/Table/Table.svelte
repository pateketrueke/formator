<script>
  import { onMount, setContext } from 'svelte';
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
  export let keys = [];

  export let association = {
    singular: 'Item',
    plural: 'Items',
  };

  let offset = -1;
  let isUpdate = false;
  let isOpen = false;
  let payload = null;
  let fieldProps = {};

  function getItems() {
    return result.map((x, k) => ({
      key: k,
      path: [],
      offset: k,
      schema: {},
      uiSchema: {},
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
        label: (uiSchema['ui:headers'] && uiSchema['ui:headers'][i]) || key,
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

  function remove() {}
  function sync() {}
  // function fetch() {}
  function reset() {}

  const rootId = randId();

  setContext('__ROOT__', {
    refs,
    rootId,
  });

  onMount(() => {
    if (actions) reload();
  });

  $: items = getItems();
  $: headers = getHeaders();
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

  <tbody>
    {#if payload}
      {#await payload}
        <tr>
          <td colspan="99">Loading data...</td>
        </tr>
      {:then}
        {#each items as { key, path, schema, offset, uiSchema } (key)}
          <tr data-field={`/${path.join('/')}`}>
            {#if uiSchema['ui:template']}
              <td>
                <Value {schema} {uiSchema} value={result[offset]} />
              </td>
            {:else}
              {#each headers as { field }}
                <td data-field={`/${path.concat(field).join('/')}`}>
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
              {#if uiSchema['ui:edit'] !== false}
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
</table>

<div>
  {#if uiSchema['ui:new'] !== false}
    <button data-is="new" type="submit" on:click={edit}>
      <span>{uiSchema['ui:new'] || `New ${association.singular}`}</span>
    </button>
  {/if}
  <Modal {uiSchema} updating={isUpdate} resource={model} bind:visible={isOpen} on:save={sync} on:close={reset}>
    <Field name="__ROOT__" bind:result={value} {...fieldProps} />
  </Modal>
</div>

