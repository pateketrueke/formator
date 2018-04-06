import { Selector } from 'testcafe';

export default class JsonSchemaForm {
  constructor() {
    this.formTitle = Selector('.json-form > .form-title');
    this.fieldLabel = Selector('.json-form .field-group .field-label');
    this.formActions = Selector('.json-form .rjsf .form-group.no-select');
  }

  field(modelName, property) {
    const jsonField = this.fieldLabel.withAttribute('for', `${modelName}_${property}`);

    jsonField.isOptional = jsonField.find('small').withText('optional');

    return jsonField;
  }
}
