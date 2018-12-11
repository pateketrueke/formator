import { renderDOM } from './helpers';

export default {
  computed: {
    fixedSchema({ field, uiSchema }) {
      return uiSchema[field] || {};
    },
    fixedNodes: ({
      value, field, props, fixedSchema,
    }) => {
      const { type, default: defaultValue } = props.properties[field] || {};

      if (fixedSchema['ui:template']) {
        return renderDOM(value, fixedSchema['ui:template']);
      }

      if (type === 'number' || type === 'integer') {
        return [value || defaultValue || 0];
      }

      if (type === 'string') {
        return [value || defaultValue || ''];
      }

      if (typeof defaultValue === 'undefined') {
        return [JSON.stringify(value)];
      }

      return [defaultValue];
    },
  },
};
