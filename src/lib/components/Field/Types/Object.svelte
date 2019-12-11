<script>
  import { onMount, getContext, createEventDispatcher } from 'svelte';
  import { randId } from '../../../shared/utils';
  import { defaultValue, getId } from '../utils';

  import Field from '..';
  import Value from '../../Value';
  import Finder from '../../Finder';

  export let uiSchema = {};
  export let schema = { type: 'object' };
  export let result = defaultValue(schema);

  export let name;
  export let path = [];
  export let through = null;
  export let association = {};

  const { refs, rootId } = getContext('__ROOT__');
  const dispatch = createEventDispatcher();

  let ref = refs[schema.id];
  let fixedResult = {};
  let hidden = [];
  let fields = [];
  let keys = [];

  function getItemFor(field, offset, subSchema) {
    const key = keys[offset] || (keys[offset] = randId());

    return {
      key,
      field,
      schema: subSchema,
      uiSchema: uiSchema[key] || {},
      path: (path || []).concat(field),
      name: (name && name !== '__ROOT__') ? `${name}[${field}]` : field,
      id: getId(rootId, (name && name !== '__ROOT__') ? `${name}[${field}]` : field),
    };
  }

  onMount(() => {
    if (ref && ref.references) {
      ref.references.primaryKeys.forEach(key => {
        const fk = `${schema.id}${key.prop[0].toUpperCase() + key.prop.substr(1)}`;

        fixedResult[fk] = fixedResult[fk] || result[key.prop];
      });
    }

    hidden = !schema.properties ? [] : Object.entries(schema.properties)
      .filter(x => uiSchema[x[0]] && uiSchema[x[0]]['ui:hidden'])
      .map(([field, subSchema], offset) => getItemFor(field, offset, subSchema), []);

    fields = !schema.properties ? [] : Object.entries(schema.properties)
      .filter(x => (uiSchema[x[0]] ? !uiSchema[x[0]]['ui:hidden'] : true))
      .sort((a, b) => {
        if (!uiSchema['ui:order']) {
          return 0;
        }

        return uiSchema['ui:order'].indexOf(b[0]) - uiSchema['ui:order'].indexOf(a[0]);
      })
      .map(([field, subSchema], offset) => getItemFor(field, offset, subSchema), []);
  });

  function append() {
    const nextSchema = (schema.additionalProperties !== true && schema.additionalProperties) || { type: 'string' };
    const nextKey = schema.patternProperties ? 'FIXME' : '';

    if (typeof result[nextKey] === 'undefined') {
      const nextValue = getItemFor(nextKey, keys.length, nextSchema);

      result[nextKey] = defaultValue(nextSchema);
      nextValue.isFixed = true;

      fields = fields.concat(nextValue);
    }
  }

  function remove(key) {
    const oldKey = fields.find(x => x.key === key);

    fields = fields.filter(x => x.key !== key);
    keys = keys.filter(x => x !== key);

    result[oldKey.field] = undefined;
  }

  function prop(e, key) {
    const { value } = e.target;

    const oldKey = fields.find(x => x.key === key);
    const oldValue = oldKey ? result[oldKey.field] : undefined;

    let nextKey = value;

    // FIXME: try other strategies?
    if (typeof result[nextKey] !== 'undefined') {
      let count = 0;

      do {
        count += 1;
        nextKey = `${value}${count}`;
        if (typeof result[nextKey] === 'undefined') break;
      } while (true);

      e.target.value = nextKey;
    }

    fields = fields.map((x, i) => (x.key === key ? { ...getItemFor(nextKey, i, x.schema), isFixed: true } : x));

    delete result[oldKey.field];

    result[nextKey] = oldValue;
  }

  function sync() {}

  function set(key, value) {
    const prop = fields.find(x => x.key === key);

    result[prop.field] = value;
  }

  $: if (Object.prototype.toString.call(result) !== '[object Object]') {
    result = {};
  }

  $: dispatch('change', result);
</script>

<fieldset>
  {#if fields.length}
    {#each hidden as { id, key, path, name, field, schema } (key)}
      <input
        {id}
        {name}
        type="hidden"
        data-type={schema.type || 'object'}
        data-field={`/${path.join('/')}`}
        bind:value={result[field]}
      />
    {/each}
    <ul>
      {#if through && through !== schema.id}
        {#each fields as { key, path, field, schema, uiSchema } (key)}
          <li data-type={schema.type || 'object'}>
            <div data-field={`/${path.join('/')}`}>
              <span>{uiSchema['ui:label'] || field}</span>
              <Value {uiSchema} value={result[field]} />
            </div>
          </li>
        {/each}
      {:else}
        {#each fields as { id, key, path, name, field, isFixed, schema, uiSchema } (key)}
          <li data-type={schema.type || 'object'}>
            <div data-field={`/${path.join('/')}`}>
              {#if isFixed}
                <input type="text" on:change={e => prop(e, key)} />
              {:else}
                <label for={id}>{uiSchema['ui:label'] || field}</label>
              {/if}

              <div>
                {#if through && field === schema.id}
                  <Finder {id} {field} {schema} {uiSchema} {association} on:change={e => sync(e, key)} />
                {/if}

                <Field
                  {path} {name} {field} {schema} {through} {uiSchema}
                  on:change={e => set(key, e.detail)}
                  parent={fixedResult}
                  result={result[field]}
                />
              </div>

              {#if isFixed && uiSchema['ui:remove'] !== false}
                <button data-is="remove" data-before="&times;" type="button" on:click={() => remove(key)}>
                  <span>{uiSchema['ui:remove'] || 'Remove prop'}</span>
                </button>
              {/if}
            </div>
          </li>
        {/each}
      {/if}
    </ul>
  {:else}
    <div data-empty>{uiSchema['ui:empty'] || 'No props'}</div>
  {/if}

  {#if schema.additionalProperties !== false}
    {#if uiSchema['ui:append'] !== false}
      <div data-actions>
        <button class="nobreak" data-is="append" data-before="&plus;" type="button" on:click={append}>
          <span>{uiSchema['ui:append'] || 'Add prop'}</span>
        </button>
      </div>
    {/if}
  {/if}
</fieldset>
