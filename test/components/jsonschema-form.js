import Component from '../helpers/component';

export default class JsonSchemaForm extends Component {
  constructor() {
    super();
    this.formTitle = '.json-form > .form-title';
    this.fieldLabel = '.json-form .field-group .field-label';
    this.formActions = '.json-form .rjsf .form-group.no-select';
  }

  async hasTitle(value) {
    await this.t
      .expect(this.formTitle.visible).ok()
      .expect(this.formTitle.innerText).contains(value);
  }

  async hasFields(value) {
    for (let field of value) {
      const label = this.fieldLabel.withAttribute('for', field.key);

      await this.t
        .expect(label.visible).ok();

      if (field.optional) {
        const small = label.find('small');

        await this.t
          .expect(small.visible).ok()
          .expect(small.innerText).contains('optional');
      }
    }
  }

  async hasActions(value) {
    for (let action of value) {
      const element = this.formActions.find(action.type);

      await this.t
        .expect(element.visible).ok()
        .expect(element.innerText).contains(action.label);
    }
  }
};
