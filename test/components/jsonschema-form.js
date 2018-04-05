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
    Object.keys(value).forEach(async field => {
      const label = this.fieldLabel.withAttribute('for', value[field].key);

      await this.t
        .expect(label.visible).ok();

      if (value[field].optional) {
        const small = label.find('small');

        await this.t
          .expect(small.visible).ok()
          .expect(small.innerText).contains('optional');
      }
    });
  }

  async hasActions(value) {
    Object.keys(value).forEach(async action => {
      const element = this.formActions.find(value[action].type);

      await this.t
        .expect(element.visible).ok()
        .expect(element.innerText).contains(value[action].label);
    });
  }
}
