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

      if (typeof value !== 'undefined' && fixedSchema['ui:template']) {
        return renderDOM(value, fixedSchema['ui:template']);
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
