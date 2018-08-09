// This script will help to load most code asynchronously, since most
// functionality is already encapsulated as components they can be
// loaded and shared easily.

const thisSrc = document.currentScript.src.split('/').slice(0, -1).join('/');

const docHead = document.getElementsByTagName('head')[0];

const BASE_URL = `${thisSrc}/components`;

const _sources = {};

/* global NODE_ENV */

function debugLog(...args) {
  if (NODE_ENV !== 'production') {
    console.log(...args);
  }
}

function loadStyle(fromSrc) {
  return Promise.resolve()
    .then(() => {
      if (!_sources[fromSrc]) {
        const link = document.createElement('link');

        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = fromSrc;

        docHead.appendChild(link);
      }
    });
}

// Due appending the desired <script> lacks on getting the app context
// we rely on overloading `currentScript` for import/export things
function loadScript(fromSrc) {
  if (_sources[fromSrc]) {
    return Promise.resolve(_sources[fromSrc].context);
  }

  // Check for deferred import-calls
  let _deferred = Promise.resolve();

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');

    // Once the script is loaded on the browser we need
    // to execute it somehow, also on this point we can
    // securely remove the script from the document's head
    script.onload = () => {
      // The injected script is able to expose functionality
      // through `document.currentScript.exports`
      _sources[fromSrc] = {
        loaded: new Date(),
        context: script.exports,
      };

      // Cleanup
      delete script.import;
      delete script.exports;

      docHead.removeChild(script);

      // Run all pending promises
      return Promise.resolve(_deferred)
        // Resolves with the exported value
        .then(() => resolve(_sources[fromSrc].context))
        .catch(e => script.onerror(e));
    };

    script.onerror = e => {
      // FIXME: how recover from this?
      debugLog(e.stack);
      reject(e);
    };

    // The injected script is able to use this symbol
    // as `document.currentScript.import`
    script.import = src => {
      // This function is very similar to `System.import()`
      // or NodeJS's `import()` call but instead it will
      // try to load known resources from BASE_URL

      const p = () => Promise.resolve()
        .then(() => {
          src = !Array.isArray(src) && src
            ? [src]
            : src;

          // Load all scripts in order, note that probably
          // using `Promise.all()` can be fast on some well
          // controlled scenarios where there are not inter-dependencies
          return src.reduce((prev, cur) =>
            prev.then(() => {
              if (cur.indexOf('//') === -1 && cur.indexOf('.js') === -1) {
                cur = `${BASE_URL}/${cur}.js`;
              }

              return (cur.indexOf('.css') > -1 ? loadStyle(cur) : loadScript(cur))
                .catch(() => debugLog('ERROR LOADING', cur));
            }), Promise.resolve());
        });

      _deferred = _deferred.then(() => p());

      return _deferred;
    };

    // Add this component on the registry
    _sources[fromSrc] = {
      loaded: null,
      context: null,
    };

    script.src = fromSrc;

    docHead.appendChild(script);
  });
}

// load components from markup definitions
const _components = [].slice.call(document.querySelectorAll('[data-component]'));

_components.forEach(node => {
  debugLog('Component declaration found', node.dataset.component);

  // Creates a host element for mounting the component
  const target = document.createElement(node.tagName !== 'SCRIPT'
    ? node.tagName
    : 'DIV');

  const prefix = node.dataset.endpoint || BASE_URL;

  target.classList.add('is-loading');

  node.parentNode.insertBefore(target, node);
  node.parentNode.removeChild(node);

  loadScript(`${prefix}/${node.dataset.component}/index.js`)
    .then(component => {
      debugLog('Component', node.dataset.component, 'loaded');

      // Parses innerText as JSON, what a deal!
      let options;

      try {
        options = JSON.parse(node.innerText);
      } catch (e) {
        options = {};
      }

      // Ok, let the component do his magic here...
      if (component) {
        target.classList.remove('is-loading');

        debugLog('Component init', options);

        return component.init(target, options);
      }
    });
});
