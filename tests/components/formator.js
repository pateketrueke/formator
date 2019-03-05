import { Selector } from 'testcafe';

export default class Formator {
  constructor(rootId) {
    this.jsonForm = Selector(`#${rootId} + .formator`);
    this.failure = this.jsonForm.find('[data-failure]');
  }
}
