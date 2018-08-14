{#if visible}
  <div data-modal on:click="cancel(event)">
    <div data-content>
      <slot></slot>
      <div>
        <button type="button" on:click="save()">
          <span>Save</span>
        </button>
        <button type="button" on:click="close(event)">
          <span>Cancel</span>
        </button>
      </div>
    </div>
  </div>
{/if}

<script>
const STACK = [];

window.addEventListener('keyup', e => {
  if (e.keyCode === 27) {
    const last = STACK.pop();

    if (last) {
      last.close();
    }
  }
});

export default {
  ondestroy() {
    const offset = STACK.indexOf(this);

    if (offset !== -1) {
      STACK.splice(offset, 1);
    }
  },
  onupdate() {
    const { visible } = this.get();

    if (visible) {
      STACK.push(this);
    } else {
      STACK.splice(STACK.indexOf(this), 1);
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
</script>
