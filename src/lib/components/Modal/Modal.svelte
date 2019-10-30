<script>
  import { In } from 'svql';

  export let visible = false;

  let uiSchema = {};
  let updating = false;
  let resource = 'input';

  function close() {
    visible = false;
  }

  function sync() {}
</script>

<style>
  .formator-modal > div {
    padding: 0;
    border: 0;
  }
</style>

{#if visible}
  <In modal on:cancel={close} on:submit={sync} class="formator-modal">
    <div data-content>
      {#if uiSchema['ui:caption']}
        <h2>{uiSchema['ui:caption']}</h2>
      {/if}
      <slot />
      <div data-actions>
        <button data-is="close" type="button" on:click={close}>
          <span>{uiSchema['ui:cancel'] || 'Cancel'}</span>
        </button>
        <button data-is="save" type="submit">
          <span>{updating
            ? uiSchema['ui:update'] || `Update ${resource}`
            : uiSchema['ui:save'] || `Save ${resource}`}</span>
        </button>
      </div>
    </div>
  </In>
{/if}
