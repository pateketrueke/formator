{#if items.length}
  {#if through}
    <table>
      <thead>
        <tr>
          {#each headers as { label }}
            <th>{label}</th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each items as { key, path, props, offset, isFixed, uiSchema } (key)}
          <tr data-field={`/${path.join('/')}`}>
            {#each headers as { field }}
              <td data-field={`/${path.concat(field).join('/')}`}>
                <Value {props} {field} {uiSchema} value={values[offset][field]} />
              </td>
            {/each}
            <th>
              {#if !isFixed}
                <button data-before="&#9998;" type="button" on:click="edit(offset)">
                  <span>{fixedSchema['ui:edit'] || `Edit ${association.singular}`}</span>
                </button>
                <button data-before="&times;" type="button" on:click="remove(offset)">
                  <span>{fixedSchema['ui:remove'] || `Remove ${association.singular}`}</span>
                </button>
              {/if}
            </th>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <fieldset>
      <ul>
        {#each items as { key, path, props, offset, isFixed, uiSchema } (key)}
          <li data-type={props.type || 'object'}>
            <div data-field={`/${path.join('/')}`}>
              <div>
                <Field {props} {uiSchema} bind:result="values[offset]" name={`${name}[${offset}]`} />
              </div>
              {#if !isFixed}
                <div>
                  <button data-before="&times;" type="button" on:click="remove(offset)">
                    <span>{fixedSchema['ui:remove'] || 'Remove item'}</span>
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
      <Modal {uiSchema} updating={isUpdate} resource={association.singular} bind:visible="isOpen" on:save="sync()">
        <Field {...nextProps} {association} {through} bind:result="nextValue" name={`${name}[${nextOffset}]`} />
      </Modal>
    {:else}
      <button data-before="&plus;" type="button" on:click="append()">
        <span>{uiSchema['ui:append'] || 'Add item'}</span>
      </button>
    {/if}
  </div>
{/if}

<script src="script.js"></script>
