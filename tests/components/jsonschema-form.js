import { Selector } from 'testcafe';

export default class JsonSchemaForm {
  constructor() {
    this.jsonForm = Selector('.json-form');
    this.formTitle = this.jsonForm.find('.form-title');
    this.fieldLabel = this.jsonForm.find('.field-group .field-label');
    this.formActions = this.jsonForm.find('.rjsf .form-group.no-select');
  }

  field(modelName, property) {
    const jsonField = this.fieldLabel.withAttribute('for', `${modelName}_${property}`);

    jsonField.isOptional = jsonField.find('small').withText('optional');

    return jsonField;
  }
}
