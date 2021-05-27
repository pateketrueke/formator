<script context="module">// eslint-disable-line
  import { renderDOM, formatValue } from './helpers';
  import { isScalar, isEmpty } from '../../shared/utils';
</script>

<script>
  export let root;
  export let value;
  export let schema = {};
  export let uiSchema = {};

  function getNodes() {
    const { type, default: defaultValue } = schema;

    if (value instanceof window.File) {
      value = {
        name: value.name.split('/').pop(),
        path: value.name,
        size: value.size,
        type: value.type,
        mmtime: value.lastModifiedDate.toGMTString(),
      };
    }

    if (isEmpty(value)) {
      return [];
    }

    if (typeof value !== 'undefined') {
      if (uiSchema['ui:format']) return formatValue(value, uiSchema['ui:format']);
      if (uiSchema['ui:template']) return renderDOM(root, value, uiSchema['ui:template']);
    }

    if (type === 'number' || type === 'integer') {
      return [value || defaultValue || 0];
    }

    if (type === 'string') {
      return [value || defaultValue];
    }

    if (typeof defaultValue === 'undefined') {
      return [(!isScalar(value) && JSON.stringify(value)) || value];
    }

    return [defaultValue];
  }

  // FIXME: doing just `$: children = getNodes();` did not cause re-render (?)
  $: children = typeof value !== 'undefined' ? getNodes() : [];
</script>

{#each children as node}
  {#if typeof node === 'object'}
    <svelte:component {...node.options} this={node.component} callback={node.onClick} />
  {:else}
    {node}
  {/if}
{/each}
