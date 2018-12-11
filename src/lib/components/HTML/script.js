export default {
  oncreate() {
    const { element, markup } = this.get();
    const { target } = this.refs;

    if (element instanceof Element) {
      target.parentNode.insertBefore(element, target);
      target.parentNode.removeChild(target);
    }

    if (typeof markup === 'string') {
      target.innerHTML = markup;
    }
  },
};
