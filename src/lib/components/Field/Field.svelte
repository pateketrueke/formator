<script context="module">
  import ErrorType from '../Error.svelte';
  import LoaderType from '../Loader.svelte';

  import { componentType } from '../../shared';
  import { reduceRefs } from '../../shared/utils';
</script>

<script>
  import { getContext } from 'svelte';

  export let path = [];
  export let name = 'field';
  export let id = null;
  export let model = null;
  export let result = null;
  export let parent = null;
  export let through = null;
  export let required = null;
  export let schema = {};
  export let uiSchema = {};
  export let association = {};

  const { refs, rootId } = getContext('__ROOT__');

  let err = null;
  let propType = null;

  function validate() {}

  $: {
    let _schema = reduceRefs(schema, refs);

    if (refs[name] && !schema.id && schema.items) {
      const { through: through$, ...association$ } = refs[name];
      const refItems = schema.items;
      const refSchema = refs[through];
      const propSchema = refs[refItems.id];

      through = through$;
      association = association$;

      _schema = {
        [name]: {
          ...refSchema,
          properties: {
            ...(refSchema && refSchema.properties),
            [refItems.id]: reduceRefs(propSchema, refs),
          },
        },
      };

      if (refItems) {
        _schema.type = 'array';
      }
    }

    schema = _schema;
  }

  $: if (err) {
    propType = ErrorType;
  } else if (!schema) {
    propType = LoaderType;
  } else {
    propType = componentType(schema, uiSchema);
  }
</script>

{#if propType}
  <svelte:component
    {id} {err} {path} {name} {model} {parent} {schema} {uiSchema} {rootId} {through} {required} {association}
    on:change on:sync={validate} bind:result
    this={propType.default || propType}
  />
{/if}
