<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { getItems, defaultValue } from '../utils';
  import { API, randId } from '../../../shared/utils';

  import Field from '../../Field';
  import Value from '../../Value';
  import Modal from '../../Modal';

  export let association = {};
  export let uiSchema = {};
  export let path = [];
  export let through = null;
  export let name = undefined;
  export let schema = { type: 'array' };
  export let result = defaultValue(schema);

  const { actions, refs } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  let nextValue = {};
  let nextProps = {};
  let nextOffset = 0;
  let isUpdate = false;
  let isOpen = false;
  let headers = [];
  let items = [];
  let keys = [];
  let ref = null;
  let pk = null;

  $: isFixed = Array.isArray(schema.items);

  $: {
    // FIXME: make a helper of this, also retrieve model from refs[name] is the right path!
    // const ref$ = refs[name];
    // const pk$ = ref$ && ref$.references && ref$.references.primaryKeys[0].prop;

    // // actions = ref ? actions[ref.through || ref.model] : false;
    // ref = ref$;
    // pk = pk$;

    // if (isFixed) {

    // }

    if (isFixed) {
      // const keys$ = [];
      // const result$ = [];

      // schema.items.forEach((props, offset) => {
      //   keys$.push(randId());
      //   result$.push(result[offset] || defaultValue(props));
      // });

      // keys = keys$;
      // result = result$;
      items = schema.items.map((_, offset) => {
        const key = keys[offset] || (keys[offset] = randId());

        return {
          key,
          offset,
          path: (path || []).concat(offset),
          schema: getItems(schema, offset),
          uiSchema: uiSchema[offset] || {},
          isFixed: offset < schema.items.length,
        };
      });
    } else {
      // items = result.map((_, offset) => {
      //   const props = getItems(schema, offset);
      //   const key = keys[offset] || (keys[offset] = randId());

      //   return {
      //     key,
      //     props,
      //     offset,
      //     path: (path || []).concat(offset),
      //     isFixed: isFixed && offset < schema.items.length,
      //     uiSchema: isFixed ? uiSchema[offset] || {} : uiSchema,
      //   };
      // });
    }
  }

  function open() { console.log('open'); }
  function sync() { console.log('sync'); }
  function edit() { console.log('edit'); }
  function reset() { console.log('reset'); }
  function remove() { console.log('remove'); }
  function append() { console.log('append'); }
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
                <Value {field} {schema} uiSchema={uiSchema[field]} value={result[offset][field]} />
              </td>
            {/each}
            <th>
              {#if !isFixed}
                {#if uiSchema['ui:edit'] !== false}
                  <button data-is="edit" data-before="&#9998;" type="button" on:click={() => edit(offset)}>
                    <span>{uiSchema['ui:edit'] || `Edit ${association.singular}`}</span>
                  </button>
                {/if}
                {#if uiSchema['ui:remove'] !== false}
                  <button data-is="remove" data-before="&times;" type="button" on:click={() => remove(offset)}>
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
              <Value {uiSchema} value={result[offset]} />
            {:else}
              <div data-field={`/${path.join('/')}`}>
                <div>
                  <Field {schema} {uiSchema} bind:result={result[offset]} name={`${name}[${offset}]`} />
                </div>
                {#if !isFixed && uiSchema['ui:remove'] !== false}
                  <div>
                    <button data-is="remove" data-before="&times;" type="button" on:click={() => remove(offset)}>
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
  <div>
    {#if through}
      {#if uiSchema['ui:append'] !== false}
        <button data-is="append" type="button" on:click={open}>
          <span>{uiSchema['ui:append'] || `Add ${association.singular}`}</span>
        </button>
      {/if}
      <Modal {uiSchema} updating={isUpdate} resource={association.singular} bind:visible={isOpen} on:save={sync} on:close={reset}>
        <Field {...nextProps} {association} {through} bind:result={nextValue} name={`${name}[${nextOffset}]`} />
      </Modal>
    {:else if uiSchema['ui:append'] !== false}
      <button data-is="append" data-before="&plus;" type="button" on:click={append}>
        <span>{uiSchema['ui:append'] || 'Add item'}</span>
      </button>
    {/if}
  </div>
{/if}
