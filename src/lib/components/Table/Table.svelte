<table>
  <tr>
    {#each headers as { label }}
      <th>{label}</th>
    {/each}
  </tr>

  {#each items as { key, path, props, offset, uiSchema } (key)}
    <tr data-field={`/${path.join('/')}`}>
      {#each headers as { field }}
        <td data-field={`/${path.concat(field).join('/')}`}>
          <Value {props} {field} {uiSchema} value={values[offset][field]} />
        </td>
      {/each}
    </tr>
  {/each}
</table>

<script src="script.js"></script>
