<slot>
  {#if fixedSchema['ui:title']}
    <h2>{fixedSchema['ui:title']}</h2>
  {/if}
  {#if actions}
    <form on:submit="save(event)" {...formProps}>
      <Field name='__ROOT__' bind:result="value" {...fieldProps} />
      <div>
        <button data-is="save" type="submit">
          <span>{fixedSchema['ui:save'] || 'Save'}</span>
        </button>
        <input type="hidden" name="_method" value={nextAction.verb}/>
      </div>
    </form>
  {:else}
    <Field name='__ROOT__' bind:result="value" {...fieldProps} />
  {/if}
</slot>

<script src="script.js"></script>
