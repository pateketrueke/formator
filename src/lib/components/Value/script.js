import { renderDOM } from './helpers';

export default {
  computed: {
    fixedNodes: ({
      value, field, props, uiSchema,
    }) => {
      const { type, default: defaultValue } = props.properties[field] || {};

      if (typeof value !== 'undefined' && uiSchema['ui:template']) {
        return renderDOM(value, uiSchema['ui:template']);
      }

      if (type === 'number' || type === 'integer') {
        return [value || defaultValue || 0];
      }

      if (type === 'string') {
        return [value || defaultValue || ''];
      }

      if (typeof defaultValue === 'undefined') {
        return [typeof value !== 'undefined'
          ? JSON.stringify(value)
          : 'N/A'];
      }

      return [defaultValue];
    },
  },
};
