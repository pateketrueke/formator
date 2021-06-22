const STACK = [];

let t;
window.addEventListener('keydown', e => {
  if ((e.shiftKey && e.keyCode !== 9) || e.ctrlKey || e.altKey || e.metaKey) return;

  if (STACK.length) {
    e.preventDefault();
    e.stopPropagation();
  }

  const last = STACK[STACK.length - 1];

  if (last && typeof last.keyup === 'function') {
    if (last.keyup(e) === false) return;
  }

  if (last && e.keyCode === 27) {
    last.close();
  }
}, true);

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
