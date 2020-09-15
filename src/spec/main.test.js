/* eslint-disable no-restricted-globals */

const details = [].slice.call(document.querySelectorAll('body > div > details'));
const summaries = [].slice.call(document.querySelectorAll('body > div > details > summary'));

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
