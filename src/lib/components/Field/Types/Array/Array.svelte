{#if items.length}
  {#if through}
    <table>
      <tr>
        {#each headers as { label }}
          <th>{label}</th>
        {/each}
      </tr>
      {#each items as { key, props, offset, isFixed, uiSchema } (key)}
        <tr>
          {#each headers as { field }}
            <td>
              <Value {props} {field} {uiSchema} value={values[offset][field]} />
            </td>
          {/each}
          <th>
            {#if !isFixed}
              <button data-remove="&#9998;" type="button" on:click="edit(offset)">
                <span>Edit item</span>
              </button>
              <button data-remove="&times;" type="button" on:click="remove(offset)">
                <span>Remove item</span>
              </button>
            {/if}
          </th>
        </tr>
      {/each}
    </table>
  {:else}
    <fieldset>
      <ul>
        {#each items as { key, props, offset, isFixed, uiSchema } (key)}
          <li data-type={props.type || 'object'}>
            <div data-item>
              <div>
                <Field {props} {uiSchema} bind:result="values[offset]" name={`${name}[${offset}]`} />
              </div>
              {#if !isFixed}
                <div>
                  <button data-remove="&times;" type="button" on:click="remove(offset)">
                    <span>Remove item</span>
                  </button>
                </div>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    </fieldset>
  {/if}
{:else}
  <div data-empty>{fixedSchema['ui:empty'] || 'No items'}</div>
{/if}

{#if schema.additionalItems !== false}
  <div>
    {#if through}
      <button type="button" on:click="open()">
        <span>{uiSchema['ui:append'] || `Add ${association.singular}`}</span>
      </button>
      <Modal {uiSchema} bind:visible="isOpen" on:save="sync()">
        <Field {...nextProps} bind:result="nextValue" name={`${name}[${nextOffset}]`} />
      </Modal>
    {:else}
      <button data-append="&plus;" type="button" on:click="append()">
        <span>{uiSchema['ui:append'] || 'Add item'}</span>
      </button>
    {/if}
  </div>
{/if}

<script src="script.js"></script>
