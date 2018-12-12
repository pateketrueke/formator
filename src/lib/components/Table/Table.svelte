<table>
  <thead>
      <tr>
      {#each headers as { label }}
        <th>{label}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each items as { key, path, props, offset, uiSchema } (key)}
      <tr data-field={`/${path.join('/')}`}>
        {#each headers as { field }}
          <td data-field={`/${path.concat(field).join('/')}`}>
            <Value {props} {field} {uiSchema} value={values[offset][field]} />
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
  <tfoot>
    <tr>
      <th>
        <button type="submit" on:click="append()">
          <span>{fixedSchema['ui:new'] || 'New'}</span>
        </button>
        <Modal {uiSchema} resource="test" bind:visible="isOpen" on:save="add()">
          <Field name='__ROOT__' bind:result="value" {...fieldProps} />
        </Modal>
      </th>
    </tr>
  </tfoot>
</table>

<script src="script.js"></script>
