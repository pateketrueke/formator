<script>
  import { onDestroy } from 'svelte';
  import { $ as render, patch, mount } from '../Value/widgets';

  export let markup;
  export let vnode;

  let prev;
  let ref;

  $: {
    if (ref) {
      if (typeof markup === 'string') {
        ref.innerHTML = markup;
      } else if (vnode) {
        if (!prev) {
          mount(ref, prev = vnode, render);
        } else {
          patch(ref, prev, prev = vnode, null, render);
        }
      }
    }
  }

  onDestroy(() => {
    while (ref.firstChild) ref.removeChild(ref.firstChild);
  });
</script>

<div data-ref bind:this={ref} />
