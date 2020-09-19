const STACK = [];

let skip;
let t;

function onClose(e) {
  if (skip) {
    skip = false;
    return;
  }

  const last = STACK[STACK.length - 1];

  if (last && typeof last.keyup === 'function') {
    if (last.keyup(e) === false) return;
  }

  if (last && e.keyCode === 27) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      if (e.target.type === 'search' && e.target.value) {
        e.target.value = '';
      }

      e.target.blur();
      return;
    }

    last.close();
  }
}

window.addEventListener('keyup', e => {
  clearTimeout(t);
  t = setTimeout(() => onClose(e), 60);
});

export function stopPropagation() {
  skip = true;
}

export function destroy(target) {
  const offset = STACK.indexOf(target);

  if (offset !== -1) {
    STACK.splice(offset, 1);
  }
}

export function update(target, isVisible) {
  if (isVisible) {
    STACK.push(target);
  } else {
    STACK.splice(STACK.indexOf(target), 1);
  }
}
