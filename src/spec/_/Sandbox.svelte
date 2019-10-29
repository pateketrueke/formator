<script>
  import Form from '../../lib/components/Form';

  // FIXME: turn this shit into a REPL?

  let uiSchema = {};
  let schema = {};

  let value1 = `
    {
      "ui:empty": "Nothing to see here...",
      "ui:append": "Add a new field",
      "ui:remove": "DEL"
    }
  `;
  let value = `
    {
      "type": "object",
      "properties": {
        "title": {
          "type": "string"
        },
        "desc": {
          "type": "string"
        }
      }
    }
  `;

  let result;

  $: {
    try {
      uiSchema = JSON.parse(value1);
    } catch (e) {
      uiSchema = {};
    }

    try {
      schema = JSON.parse(value);
    } catch (e) {
      schema = {};
      result = undefined;
    }
  }
</script>

<style>
  div {
    display: flex;
  }
  textarea {
    position: relative;
    height: 10em;
    width: 100%;
    border: 0;
  }
  ::-webkit-resizer {
    display: none;
  }
</style>

<div>
  <textarea data-title="schema" bind:value />
  <textarea data-title="uiSchema" bind:value={value1} />
</div>

<Form {schema} {uiSchema} bind:result />

{#if typeof result !== 'undefined'}
  <pre>{JSON.stringify(result, null, 2)}</pre>
{/if}
