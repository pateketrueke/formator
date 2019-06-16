<script>
  export let schema = null;
  export let props = null;
  export let err = null;

  let errorMessage = 'An error has ocurred';

  $: jsonProps = JSON.stringify(props, null, 2);
  $: {
    if (err) {
      errorMessage = err;
    } else if (!schema) {
      errorMessage = 'Missing definition';
    } else {
      errorMessage = 'Unknown error';
    }
  };
</script>

<details data-failure>
  <summary>{errorMessage}</summary>
  <pre>{jsonProps}</pre>
</details>
