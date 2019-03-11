{#if visible}
  <div data-modal ref:modal on:click="cancel(event)">
    <div data-content>
      <slot></slot>
      <div>
        <button data-is="close" type="button" on:click="close()">
          <span>{uiSchema['ui:cancel'] || 'Cancel'}</span>
        </button>
        <button data-is="save" type="button" on:click="save()">
          <span>{updating
            ? uiSchema['ui:update'] || `Update ${resource}`
            : uiSchema['ui:save'] || `Save ${resource}`}</span>
        </button>
      </div>
    </div>
  </div>
{/if}

<script src="script.js"></script>
