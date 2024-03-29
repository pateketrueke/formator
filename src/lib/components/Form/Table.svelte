<script>
  import { onMount, setContext, createEventDispatcher } from 'svelte';
  import { Failure } from 'smoo';

  import Modal from '../Modal/Modal.svelte';
  import Value from '../Value/Value.svelte';
  import getField from '../../shared/field';

  let Field;
  getField().then(x => {
    Field = x;
  });

  import {
    API, randId, getProp, fixedCols, defaultValue,
  } from '../../shared/utils';

  export let pending = 'Loading...';
  export let actions = {};
  export let result = [];
  export let refs = {};
  export let model;

  export let uiSchema = {};
  export let schema = {};
  export let value = {};

  export let association = refs[model];

  const keys = refs[model].references.primaryKeys.map(x => x.prop);
  const pk = refs[model].references.primaryKeys[0].prop;
  const fieldProps = { model, schema, uiSchema };

  const dispatch = createEventDispatcher();
  const rootId = randId();

  setContext('__ROOT__', {
    refs,
    rootId,
    actions,
    schema,
    uiSchema,
  });

  let items = [];
  let offset = -1;
  let failure = null;
  let isUpdate = false;
  let isOpen = false;
  let backup = null;
  let loading = null;
  let payload = result !== null;

  let prev;
  function toggleActive(e) {
    let root = e.target;
    while (root.tagName !== 'TD') {
      if (root.tagName === 'TBODY') break;
      root = root.parentNode;
    }
    if (root.tagName === 'TD' && root.offsetWidth < root.scrollWidth) {
      if (!root.textContent.trim()) return;
      if (prev !== root) root.classList.add('focused');
      if (prev) prev.classList.remove('focused');
      if (prev === root) prev = null;
      else prev = root;
    }
  }
  function toggler(node) {
    node.addEventListener('click', toggleActive);
    return { destroy: () => node.removeEventListener('click', toggleActive) };
  }

  function handleClick(e) {
    if (prev && prev !== e.target) {
      prev.classList.remove('focused');
      prev = null;
    }
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

  function getKey(item) {
    return keys.map(k => item[k] || '_').join('.');
  }

  function getItems(from) {
    return from.map((data, _offset) => ({
      key: getKey(data),
      schema: schema.properties || {},
      offset: _offset,
      data,
    }));
  }

  function fail(e) {
    failure = e.failure;
  }

  function edit(newOffset) {
    isOpen = true;
    isUpdate = newOffset >= 0;
    offset = newOffset;
    backup = { ...result[offset] };
    value = offset >= 0 ? result[offset] : defaultValue(schema);
  }

  function reload() {
    payload = API.call(actions[model].index).then(data => {
      if (!data || data.status !== 'ok') return fail(data);
      failure = data.failure;
      result = data.result;
    });
  }

  // FIXME: turn this confirmation into a Svelte component?
  function remove(fixedOffset) {
    if (!confirm('Are you sure?')) return; // eslint-disable-line

    loading = Promise.resolve()
      .then(() => actions[model] && API.call(actions[model].destroy, {
        [pk]: result[fixedOffset][pk],
      }))
      .then(data => {
        if (data && data.status !== 'ok') return fail(data);
        result = result.filter((_, k) => k !== fixedOffset);
        loading = null;
      });
  }

  function reset() {
    result[offset] = backup;
  }

  function sync() {
    if (!value) value = {};

    if (isUpdate) {
      value[pk] = backup[pk];
    }

    loading = Promise.resolve()
      .then(() => actions[model]
        && API.call(actions[model][isUpdate ? 'update' : 'create'], value))
      .then(data => {
        loading = null;
        isOpen = false;

        if (data && data.status !== 'ok') return fail(data);
        if (data && data.result) {
          value = Object.assign(backup, data.result);
        }

        if (typeof offset === 'undefined') {
          result = result.concat(value);
        } else {
          result[offset] = value;
        }

        dispatch('change', result);
      });
  }

  onMount(() => {
    if (actions[model] && !payload) reload();

    setTimeout(() => {
      dispatch('change', result);
    });

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  });

  $: headers = getHeaders();
  $: items = getItems(result);
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

{#if failure}
  <details data-failure>
    <summary>Failure</summary>
    <pre>{failure}</pre>
  </details>
{/if}

<table class:loading={loading} data-pending={uiSchema['ui:pending'] || pending}>
  {#if uiSchema['ui:title']}
    <caption data-title>{uiSchema['ui:title']}</caption>
  {/if}

  {#if headers.length}
    <thead>
      <tr>
        {#each headers as { field, label }}
          <th class={fixedCols(uiSchema[field], headers)}>{label}</th>
        {/each}
        <th colspan="99"></th>
      </tr>
    </thead>
  {/if}

  <tbody data-field="/" data-type="array" use:toggler>
    {#if payload}
      {#await Promise.resolve(payload)}
        <tr>
          <td colspan="99" data-empty>Loading data...</td>
        </tr>
      {:then}
        {#each items as { key, data, schema, offset } (key)}
          <tr data-field="/{offset}" data-type="object">
            {#if uiSchema['ui:template']}
              <td colspan="99">
                <Value {schema} {uiSchema} value={data} />
              </td>
            {:else}
              {#each headers as { field, label }}
                <td
                  class={fixedCols(uiSchema[field], headers)}
                  data-type="{schema[field].type || 'object'}"
                  data-field="/{offset}/{field}"
                  data-label={label}
                >
                  <Value schema={schema[field]} uiSchema={uiSchema[field]} value="{getProp(data, data, field)}" root={data} />
                </td>
              {/each}
            {/if}
            <th>
              <div data-actions class="flex fill gap end">
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
              </div>
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
  <svelte:component name="__ROOT__" bind:result={value} this={Field} {...fieldProps} />
</Modal>
