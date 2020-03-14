import { Selector } from 'testcafe';

export default class Formator {
  constructor(selector) {
    this.jsonForm = Selector(`${selector} .formator`);
    this.failure = this.get('[data-failure]');
    this.empty = this.get('[data-empty]');
  }

  get(selector) {
    this._cache = this._cache || {};

    if (!this._cache[selector]) {
      this._cache[selector] = this.jsonForm.find(selector);
    }

    return this._cache[selector];
  }

  field(propName) {
    return this.get(`[data-field="${propName}"]`);
  }

  type(typeName, subField, skipNested) {
    if (!subField) {
      return this.get(`[data-type="${typeName}"]`);
    }

    if (skipNested) {
      return this.get(`[data-type="${typeName}"][data-field="${subField}"]`);
    }

    return this.get(`[data-type="${typeName}"] > [data-field="${subField}"]`);
  }

  is(actionName) {
    return this.get(`[data-is="${actionName}"]`);
  }
}

export function getForm(formId) {
  return new Formator(formId);
}
