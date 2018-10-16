{fixedValue}

<script>
export default {
  computed: {
    fixedUISchema({ field, uiSchema }) {
      return uiSchema[field] || {};
    },
    fixedValue: ({ value, field, props }) => {
      const { type, default: defaultValue } = props.properties[field];

      if (type === 'number' || type === 'integer') {
        return value || defaultValue || 0;
      }

      if (type === 'string') {
        return value || defaultValue || '';
      }

      if (typeof defaultValue === 'undefined') {
        return JSON.stringify(value);
      }

      return defaultValue;
    },
  },
};
</script>
