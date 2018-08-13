<!-- <pre>{JSON.stringify(schema, null, 2)}</pre>
<pre>{JSON.stringify(through, null, 2)}</pre>
<pre>{JSON.stringify(association, null, 2)}</pre>
 -->

<button type="button" on:click="toggle()">Add item</button>

{#if visible}
  <div data-modal on:click="toggle(event)">
    <div>MODAL CONTENT</div>
  </div>
{/if}

<script>
const STACK = [];

function onClose() {
  const last = STACK.pop();

  if (last) {
    last.pop();
  }
}

window.addEventListener('keyup', e => {
  if (e.keyCode === 27) {
    onClose();
  }
});

export default {
  oncreate() {
    window.pop = () => this.pop();
  },
  ondestroy() {
    const offset = STACK.indexOf(this);

    if (offset !== -1) {
      STACK.splice(offset, 1);
    }
  },
  methods: {
    pop() {
      this.toggle();
    },
    toggle(e) {
      if (e && e.target && !e.target.dataset.modal) {
        return;
      }

      const { visible } = this.get();

      if (!visible) {
        STACK.push(this);
      } else {
        STACK.pop();
      }

      this.set({
        visible: !visible,
      });
    },
  },
};
</script>
