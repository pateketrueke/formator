import { renderValue } from '../utils';

export default {
  computed: {
    fixedSchema({ field, uiSchema }) {
      return uiSchema[field] || {};
    },
    fixedNodes: ({
      value, field, props, fixedSchema,
    }) => {
      const { type, default: defaultValue } = props.properties[field];

      if (type === 'number' || type === 'integer') {
        return [value || defaultValue || 0];
      }

      if (type === 'string') {
        return [value || defaultValue || ''];
      }

      if (typeof defaultValue === 'undefined') {
        if (fixedSchema['ui:template']) {
          return renderValue(value, fixedSchema['ui:template']);
        }

        return [JSON.stringify(value)];
      }

      return [defaultValue];
    },
  },
};
