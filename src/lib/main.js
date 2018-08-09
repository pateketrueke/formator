import App from './_/app.svelte';

const instances = [];

[].slice.call(document.querySelectorAll('script[rel=schema]')).forEach(node => {
  let data;

  try {
    data = JSON.parse(node.innerText);
  } catch (e) {
    data = {};
  }

  const target = document.createElement('div');

  node.parentNode.insertBefore(target, node);
  node.parentNode.removeChild(node);

  const app = new App({
    target,
    data,
  });

  instances.push(app);
});
