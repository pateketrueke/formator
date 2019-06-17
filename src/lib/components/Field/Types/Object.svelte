<script>
  import { getContext, createEventDispatcher } from 'svelte';
  import { defaultValue, getId } from '../utils';

  import Field from '../../Field';
  import Value from '../../Value';
  import Finder from '../../Finder';

  export let schema = { type: 'object' };
  export let uiSchema = {};
  export let association = {};
  export let through = null;
  export let name = 'object';
  export let result = {};
  export let path = [];

  const { refs, rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  let ref = refs[schema.id];
  let fixedResult = {};
  let hidden = [];
  let fields = [];

  $: {
    fixedResult = {};

    if (ref && ref.references) {
      ref.references.primaryKeys.forEach(key => {
        const fk = `${schema.id}${key.prop[0].toUpperCase() + key.prop.substr(1)}`;

        fixedResult[fk] = fixedResult[fk] || result[key.prop];
      });
    }
  }

  $: {
    // FIXME: how to reuse?
    hidden = !schema.properties ? [] : Object.entries(schema.properties)
      .filter(x => uiSchema[x[0]] && uiSchema[x[0]]['ui:hidden'])
      .map(([key, props]) => ({
        id: getId(rootId, (name && name !== '__ROOT__') ? `${name}[${key}]` : key),
        name: (name && name !== '__ROOT__') ? `${name}[${key}]` : key,
        path: (path || []).concat(key),
        field: key,
        props,
      }), []);
  }

  $: {
    fields = !schema.properties ? [] : Object.entries(schema.properties)
      .filter(x => (uiSchema[x[0]] ? !uiSchema[x[0]]['ui:hidden'] : true))
      .sort((a, b) => {
        if (!uiSchema['ui:order']) {
          return 0;
        }

        return uiSchema['ui:order'].indexOf(b[0]) - uiSchema['ui:order'].indexOf(a[0]);
      })
      .map(([key, props]) => ({
        id: getId(rootId, (name && name !== '__ROOT__') ? `${name}[${key}]` : key),
        name: (name && name !== '__ROOT__') ? `${name}[${key}]` : key,
        uiSchema: uiSchema[key] || {},
        path: (path || []).concat(key),
        field: key,
        props,
      }), []);
  }

  function sync() {}

  function set(key, value) {
    result[key] = value;
    dispatch('change', result);
  }
</script>

{#if fields.length}
  <fieldset>
    {#each hidden as { id, path, name, field, props } (field)}
      <input
        {id}
        {name}
        type="hidden"
        data-type={props.type || 'object'}
        data-field={`/${path.join('/')}`}
        bind:value={result[field]}
      />
    {/each}
    <ul>
      {#if through && through !== props.id}
        {#each fields as { path, field, props, uiSchema } (field)}
          <li data-type={props.type || 'object'}>
            <div data-field={`/${path.join('/')}`}>
              <span>{uiSchema['ui:label'] || field}</span>
              <Value {uiSchema} value={result[field]} />
            </div>
          </li>
        {/each}
      {:else}
        {#each fields as { id, path, name, field, props, uiSchema } (field)}
          <li data-type={props.type || 'object'}>
            <div data-field={`/${path.join('/')}`}>
              <label for={id}>{uiSchema['ui:label'] || field}</label>
              <div>
                {#if through && field === props.id}
                  <Finder {id} {field} {props} {uiSchema} {association} on:change={e => sync(e, field)} />
                {/if}

                <Field
                  {path} {name} {field} {props} {through} {uiSchema}
                  on:change={e => set(field, e.detail)}
                  parent={fixedResult}
                  result={result[field]}
                />
              </div>
            </div>
          </li>
        {/each}
      {/if}
    </ul>
  </fieldset>
{:else}
  <div data-empty>{uiSchema['ui:empty'] || 'No props'}</div>
{/if}
