import { Selector } from 'testcafe';

export default class Formator {
  constructor(rootId) {
    this.jsonForm = Selector(`#${rootId} + .formator`);
    this.failure = this._get('[data-failure]');
  }

  _get(selector) {
    this._cache = this._cache || {};

    if (!this._cache[selector]) {
      this._cache[selector] = this.jsonForm.find(selector);
    }

    return this._cache[selector];
  }

  field(propName) {
    return this._get(`[data-field="${propName}"]`);
  }
}

export function getForm(formId) {
  return new Formator(formId);
}
