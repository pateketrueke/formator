export default {
  oncreate() {
    const { children, markup } = this.get();
    const { target } = this.refs;

    if (Array.isArray(children)) {
      children.forEach(element => {
        if (element instanceof Element) {
          target.appendChild(element);
        }
      });
    }

    this.on('destroy', () => {
      while (target.firstChild) target.removeChild(target.firstChild);
    });

    if (typeof markup === 'string') {
      target.innerHTML = markup;
    }
  },
};
