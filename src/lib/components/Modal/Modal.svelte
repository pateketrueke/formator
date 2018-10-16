{#if visible}
  <div data-modal on:click="cancel(event)">
    <div data-content>
      <slot></slot>
      <div>
        <button type="button" on:click="close(event)">
          <span>{uiSchema['ui:cancel'] || 'Cancel'}</span>
        </button>
        <button type="button" on:click="save()">
          <span>{uiSchema['ui:save'] || 'Save'}</span>
        </button>
      </div>
    </div>
  </div>
{/if}

<script src="script.js"></script>
