<details>
  <summary>{errorMessage}</summary>
  <pre>{JSON.stringify(props, null, 2)}</pre>
</details>

<script>
export default {
  computed: {
    errorMessage({ schema }) {
      if (!schema) {
        return 'Missing definition';
      }

      return 'Unknown error';
    },
  },
};
</script>
