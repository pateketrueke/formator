export default {
  computed: {
    errorMessage({ err, schema }) {
      if (err) {
        return err;
      }

      if (!schema) {
        return 'Missing definition';
      }

      return 'Unknown error';
    },
    jsonProps({ props }) {
      return JSON.stringify(props, null, 2);
    },
  },
};
