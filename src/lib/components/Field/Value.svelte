<p>{field}: {fixedValue}</p>

<script>
export default {
  computed: {
    fixedValue: ({ value, field, props }) => {
      const { type, default: defaultValue } = props.properties[field];

      if (type === 'number' || type === 'integer') {
        return value || defaultValue || 0;
      }

      if (type === 'string') {
        return value || defaultValue || '';
      }

      return defaultValue;
    },
  },
};
</script>
