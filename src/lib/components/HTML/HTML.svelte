<script>
  import { onMount, onDestroy } from 'svelte';
  import { $ as render, patch, mount } from '../Value/widgets';

  export let markup;
  export let vnode;

  let ref;

  onMount(() => {
    if (typeof markup === 'string') {
      ref.innerHTML = markup;
    } else if (vnode) {
      mount(ref, vnode, render);
    }
  });

  onDestroy(() => {
    while (ref.firstChild) ref.removeChild(ref.firstChild);
  });
</script>

<div data-ref bind:this={ref} />
