export default {
  oncreate() {
    const { element, markup } = this.get();
    const { target } = this.refs;

    if (element instanceof Element) {
      target.parentNode.insertBefore(element, target);
      this.on('destroy', () => element.remove());
    }

    if (typeof markup === 'string') {
      target.innerHTML = markup;
    }
  },
};
