export const loader = (Component, selector) => [].slice.call(document.querySelectorAll(selector)).map(node => {
  let target;
  let data;

  try {
    data = JSON.parse(node.dataset.resource || node.innerText);
  } catch (e) {
    data = {};
  }

  if (node.tagName === 'SCRIPT') {
    target = document.createElement('div');
    node.parentNode.insertBefore(target, node);
    node.parentNode.removeChild(node);
  } else {
    target = node;
  }

  const instance = new Component({
    target,
    data,
  });

  return instance;
});

export default {
  loader,
};
