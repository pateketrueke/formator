const main = require('./lib/main');
const res = require('./lib/res');

module.exports = class Formator {
  constructor(database) {
    Object.assign(this, { database });
  }

  hook(options) {
    return main(this.database, options || {});
  }

  bind(Model, params, options) {
    return res(this.database, null, Model, params || {}, options || {}).actions;
  }
};
