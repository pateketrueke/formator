{#if fields.length}
  <fieldset>
    <ul>
      {#each fields as { id, path, name, field, props, uiSchema } (field)}
        {#if uiSchema['ui:hidden']}
          <li style="display:none">
            <input type="hidden" {name} bind:value="fixedValues[field]" />
          </li>
        {:else}
          <li data-type={props.type || 'object'}>
            <div data-field={`/${path.join('/')}`}>
              <label for={id}>{uiSchema['ui:label'] || field}</label>
              <div>
                {#if through && field === props.id}
                  <Finder {field} {items} {uiSchema} {association} on:change="test(event)" />
                {/if}
                <Field {path} {name} {field} {props} {uiSchema} bind:result="fixedValues[field]" />
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
