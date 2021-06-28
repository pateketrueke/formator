import extensions from './exts';
import components from './deps';

export function componentType(schema, uiSchema) {
  let component;
  if (schema.enum) {
    component = extensions.Enum;
  } else if (uiSchema['ui:component']) {
    component = extensions[uiSchema['ui:component']];
  }
  component = component || components[schema.type || 'object'];
  return component;
}
