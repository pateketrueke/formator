const STACK = [];

window.addEventListener('keyup', e => {
  if (e.keyCode === 27) {
    const last = STACK.pop();

    if (last) {
      last.close();
    }
  }
});

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
