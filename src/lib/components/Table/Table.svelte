<script>
  import { onMount, setContext, createEventDispatcher } from 'svelte';
  import { Failure } from 'svql';

  import Modal from '../Modal';
  import Field from '../Field';
  import Value from '../Value';

  import { defaultValue } from '../Field/utils';
  import { API, randId } from '../../shared/utils';

  export let pending = 'Loading...';
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

  let pk = 'id';
  let offset = -1;
  let isUpdate = false;
  let isOpen = false;
  let backup = null;
  let loading = null;
  let payload = result.length !== 0;

  // FIXME: this is the ideal payload to build, for full-render support!!
  // however, regular flow is not creating/keeping this structure... we
  // need to revisit each point to make sure...
  // result[0].items = [{ id: 0, qty: 1, Product: { name: 'x', price: 1 } }, { id: 0, qty: 1, Product: { name: 'y', price: 2 } }];

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

  function fail(e) {
    console.log('ERROR', e);
  }

  function edit(newOffset) {
    isOpen = true;
    isUpdate = newOffset >= 0;
    offset = newOffset;
    backup = { ...result[offset] };
    value = offset >= 0 ? result[offset] : defaultValue(schema);
  }

  function reload() {
    payload = API.call(actions[model].index).then(resp => {
      result = resp.result;
    });
  }

  function remove(fixedOffset) {
    if (!confirm('Are you sure?')) return; // eslint-disable-line

    loading = Promise.resolve()
      .then(() => actions[model] && API.call(actions[model].destroy, {
        [pk]: result[fixedOffset][pk],
      }))
      .then(data => {
        loading = null;
        if (data && data.status !== 'ok') return fail(data);
        result = result.filter((_, k) => k !== fixedOffset);
        items = getItems();
      });
  }

  function reset() {
    result[offset] = backup;
  }

  function sync() {
    loading = Promise.resolve()
      .then(() => actions[model]
        && API.call(actions[model][isUpdate ? 'update' : 'create'], value))
      .then(data => {
        loading = null;
        isOpen = false;

        if (data && data.status !== 'ok') return fail(data);
        if (!isUpdate && data) value = data.result;

        if (typeof offset === 'undefined') {
          result = result.concat(value);
        }

        dispatch('change', result);

        items = getItems();
      });
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
  $: pk = refs[model].references.primaryKeys[0].prop;
</script>

<style>
  table {
    position: relative;
  }
  table.loading::before {
    width: 100%;
    height: 100%;
    content: attr(data-pending);
    text-align: center;
    padding-top: 2em;
    cursor: wait;
    position: absolute;
    pointer-events: none;
    background-color: rgba(255, 255, 255, .75);
  }
</style>

<table class:loading={loading} data-pending={uiSchema['ui:pending'] || pending}>
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

<Modal {uiSchema} updating={isUpdate} resource={model} bind:visible={isOpen} on:save={sync} on:cancel={reset}>
  <Field name="__ROOT__" bind:result={value} {...fieldProps} />
</Modal>
