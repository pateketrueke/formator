{#if fields.length}
  <fieldset>
    <ul>
      {#each fields as { id, name, field, props, uiSchema } (field)}
        {#if uiSchema['ui:hidden']}
          <li style="display:none">
            <input type="hidden" {name} bind:value="fixedValues[field]" />
          </li>
        {:else}
          <li data-type={props.type || 'object'}>
            <div data-field>
              <label for={id}>{uiSchema['ui:label'] || field}</label>
              <div>
                <Field {name} {field} {props} {uiSchema} bind:result="fixedValues[field]" />
              </div>
            </div>
          </li>
        {/if}
      {/each}
    </ul>
  </fieldset>
{:else}
  <div data-empty>{fixedSchema['ui:empty'] || 'No props'}</div>
{/if}

<script src="script.js"></script>
