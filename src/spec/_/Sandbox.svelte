<script>
  import Form from '../../lib/components/Form';

  // FIXME: turn this shit into a REPL?

  let schema = {};
  let value = '';
  let result;

  $: {
    try {
      schema = JSON.parse(value);
    } catch (e) {
      schema = {};
      result = undefined;
    }
  }
</script>

<style>
  textarea {
    height: 10em;
    width: 100%;
    border: 0;
  }
</style>

<textarea bind:value />

<Form {schema} bind:result />

{#if typeof result !== 'undefined'}
  <pre>{JSON.stringify(result, null, 2)}</pre>
{/if}
