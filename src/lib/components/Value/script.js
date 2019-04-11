import { renderDOM } from './helpers';
import { isScalar } from '../../shared/utils';

export default {
  computed: {
    fixedSchema({ uiSchema }) {
      return uiSchema || {};
    },
    fixedNodes: ({
      value, field, props, fixedSchema,
    }) => {
      const { type, default: defaultValue } = (field && props.properties[field]) || {};

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
        return [(!isScalar(value) && JSON.stringify(value)) || (value === '' ? 'N/A' : value)];
      }

      return [defaultValue];
    },
  },
};
