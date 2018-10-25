module.exports = (options, isJSON) => {
  options = options || {};

  if (typeof options.url !== 'function') {
    throw new Error(`Missing url() helper, given '${options.url}'`);
  }

  return Promise.resolve()
    .then(() => {
      if (!options.resource) {
        return {
          json: !!isJSON,
          status: 'ok',
          result: options.modelNames,
        };
      }

      const res = options.resource;
      const Model = options.modelInstance;
      const action = options.action || 'index';

      function sendError(err) {
        return {
          e: err,
          json: !!isJSON,
          result: (err && (err.message)) || 'Not found',
        };
      }

      function sendResult(data) {
        return {
          json: !!isJSON,
          status: 'ok',
          result: data,
        };
      }

      if (['create', 'update', 'destroy'].indexOf(action) !== -1) {
        return res.actions[action]().then(sendResult).catch(sendError);
      }

      res.options.isNew = action === 'new';
      res.options.action = action;
      res.options.actions = {};
      res.options.schema.type = res.options.schema.type || 'object';

      function addMethod(verb, actionName, resourceName) {
        return {
          verb,
          path: options.url(resourceName, actionName),
        };
      }

      function addAction(resourceName) {
        res.options.actions[resourceName] = {
          index: addMethod('GET', undefined, resourceName),
          new: addMethod('GET', 'new', resourceName),
          create: addMethod('PUT', undefined, resourceName),
          edit: addMethod('GET', 'edit', resourceName),
          show: addMethod('GET', 'show', resourceName),
          update: addMethod('PATCH', 'update', resourceName),
          destroy: addMethod('DELETE', 'delete', resourceName),
        };
      }

      addAction(options.modelName);

      Model.primaryKeyAttributes.forEach(prop => {
        if (res.options.refs[prop]) {
          addAction(res.options.refs[prop].model);

          res.options.schema.properties[prop] = {
            $ref: res.options.refs[prop].model,
          };
        } else if (res.options.schema.required) {
          const offset = res.options.schema.required.indexOf(prop);

          if (offset !== -1) {
            res.options.schema.required.splice(offset, 1);
          }
        }
      });

      Object.keys(res.options.refs).forEach(refId => {
        if (refId === (res.options.refs[refId].model || res.options.refs[refId].id)) {
          if (!res.options.refs[refId].definitions) {
            addAction(refId);
          }
        }

        if (res.options.refs[refId].through) {
          const model = typeof res.options.refs[refId].through.model === 'string'
            ? res.options.refs[refId].through.model
            : res.options.refs[refId].through;

          addAction(model);
        }
      });

      if (!isJSON) {
        if (['edit', 'show', 'index'].indexOf(action) !== -1) {
          const isOne = action === 'edit' || action === 'show';

          return res.actions[isOne ? 'findOne' : 'findAll']()
            .catch(error => {
              res.options.failure = error.message;

              return isOne
                ? null
                : [];
            })
            .then(result => {
              res.options.result = result;

              return res.options;
            });
        }

        return res.options;
      }

      switch (action) {
        case 'new':
          return sendResult(res.options);

        case 'index':

          return res.actions.findAll().then(sendResult).catch(sendError);

        case 'edit':
        case 'show':
          return res.actions.findOne().then(sendResult).catch(sendError);

        default:
          return sendError();
      }
    });
};
