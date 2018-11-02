import { render } from 'somedom';

export default {
  oncreate() {
    const { markup } = this.get();
    const { target } = this.refs;

    // FIXME: consider vnode-patching on updates?
    const html = render(markup);

    target.appendChild(html);
  },
};
