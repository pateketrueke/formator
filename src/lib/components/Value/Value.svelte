<script context="module">
  import { renderDOM } from './helpers';
  import { isScalar } from '../../shared/utils';
</script>

<script>
  export let value;
  export let schema = {};
  export let uiSchema = {};

  function getNodes() {
    const { type, default: defaultValue } = schema;

    if (typeof value !== 'undefined' && uiSchema && uiSchema['ui:template']) {
      return renderDOM(value, uiSchema['ui:template']);
    }

    if (type === 'number' || type === 'integer') {
      return [value || defaultValue || 0];
    }

    if (type === 'string') {
      return [value || defaultValue || ''];
    }

    if (typeof defaultValue === 'undefined') {
      if (typeof value === 'undefined') {
        return [];
      }

      return [(!isScalar(value) && JSON.stringify(value)) || (value === '' ? 'N/A' : value)];
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
