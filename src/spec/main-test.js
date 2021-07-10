/* eslint-disable no-restricted-globals */
import App from './components/Builder.svelte';

new App({ // eslint-disable-line
  target: document.getElementById('builder'),
});

const details = [].slice.call(document.querySelectorAll('body > div > details, #builder > details'));
const summaries = [].slice.call(document.querySelectorAll('body summary[id]'));

window.addEventListener('click', e => {
  const index = summaries.indexOf(e.target);

  if (index !== -1) {
    summaries.forEach((node, offset) => {
      details[offset].removeAttribute('open');

      if (offset === index) {
        history.replaceState(null, document.title, `#${summaries[offset].id}`);
      }
    });
  }
});

setTimeout(() => {
  if (location.hash) {
    const target = document.querySelector(location.hash);

    if (target && target.tagName === 'SUMMARY') {
      target.click();
    }
  }
});
