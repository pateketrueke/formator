import { destroy, update } from './stacked';

export default {
  ondestroy() {
    destroy(this);
  },
  onupdate() {
    update(this, this.get().visible);
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
