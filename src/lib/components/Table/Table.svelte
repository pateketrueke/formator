<script>
  import { setContext } from 'svelte';

  import Modal from '../Modal';
  import Field from '../Field';

  import { defaultValue } from '../Field/utils';
  import { API, randId } from '../../shared/utils';

  let association = {
    singular: 'Item',
    plural: 'Items',
  };

  let refs = {};
  let model = {};
  let uiSchema = {};
  let result = null;
  let value = {};
  let keys = [];

  let offset = -1;
  let items = [];
  let schema = {};
  let values = [];
  let headers = [];
  let isUpdate = false;
  let isOpen = false;
  let payload = null;
  let fieldProps = {};
  let fixedSchema = {};

  function edit(newOffset) {
    isOpen = true;
    offset = newOffset;
    value =  offset >= 0 ? values[offset] : defaultValue(schema);
  }

  function load() {}
  function remove() {}
  function sync() {}
  function fetch() {}
  function reset() {}

  const rootId = randId();

  setContext('__ROOT__', {
    refs,
    rootId,
  });
</script>

<table>
  {#if uiSchema['ui:title']}
    <caption>{uiSchema['ui:title']}</caption>
  {/if}

  <thead>
    <tr>
      {#each headers as { label }}
        <th>{label}</th>
      {/each}
      <th></th>
    </tr>
  </thead>
  <tbody>

    {#if payload}
      {#await payload}
        <tr>
          <td colspan="99">Loading data...</td>
        </tr>
      {:then}
        {#each items as { key, path, props, offset, uiSchema } (key)}
          <tr data-field={`/${path.join('/')}`}>
            {#if uiSchema['ui:template']}
              <td>
                <Value {props} {uiSchema} value={values[offset]} />
              </td>
            {:else}
              {#each headers as { field }}
                <td data-field={`/${path.concat(field).join('/')}`}>
                  <Value {props} {field} uiSchema={uiSchema[field]} value={values[offset][field]} />
                </td>
              {/each}
            {/if}
            <th>
              {#if fixedSchema['ui:edit'] !== false}
                <button data-is="edit" data-before="&#9998;" type="button" on:click={() => edit(offset)}>
                  <span>{fixedSchema['ui:edit'] || 'Edit'}</span>
                </button>
              {/if}
              {#if fixedSchema['ui:edit'] !== false}
                <button data-is="remove" data-before="&times;" type="button" on:click={() => remove(offset)}>
                  <span>{fixedSchema['ui:remove'] || 'Remove'}</span>
                </button>
              {/if}
            </th>
          </tr>
        {:else}
          <tr>
            <td colspan="99" data-empty>{fixedSchema['ui:empty'] || 'No items'}</td>
          </tr>
        {/each}
      {:catch error}
        <tr>
          <td colspan="99">
            <Catch {error} />
            <button data-is="reload" on:click={load}>Try again</button>
          </td>
        </tr>
      {/await}
    {/if}
  </tbody>
</table>

<div>
  {#if fixedSchema['ui:new'] !== false}
    <button data-is="new" type="submit" on:click={edit}>
      <span>{fixedSchema['ui:new'] || `New ${association.singular}`}</span>
    </button>
  {/if}
  <Modal {uiSchema} updating={isUpdate} resource={model} bind:visible={isOpen} on:save={sync} on:close={reset}>
    <Field name="__ROOT__" bind:result={value} {...fieldProps} />
  </Modal>
</div>

