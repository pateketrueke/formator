import { destroy, update } from './stacked';

export default {
  ondestroy() {
    destroy(this);
  },
  onupdate() {
    const { visible: isVisible } = this.get();

    update(this, isVisible);

    if (isVisible) {
      const focusField = this.refs.modal.querySelector('[autofocus]');

      if (focusField && 'focus' in focusField) {
        focusField.focus();
      }
    }
  },
  methods: {
    cancel(e) {
      if (e && e.target && !e.target.dataset.modal) {
        return;
      }

      this.close(e);
    },
    close(e) {
      if (e) {
        e.preventDefault();
      }

      this.fire('close');
      this.set({ visible: false });
    },
    save() {
      this.fire('save');
      this.close();
    },
  },
};
