<details>
  <summary>{errorMessage}</summary>
  <pre>{JSON.stringify(props, null, 2)}</pre>
</details>

<script>
export default {
  computed: {
    errorMessage({ props }) {
      if (props.$ref) {
        return 'Unexpected reference';
      }

      return 'Unknown error';
    },
  },
};
</script>
