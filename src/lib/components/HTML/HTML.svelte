<script>
  import { onMount, onDestroy } from 'svelte';
  import { $ as render, mount, unmount } from '../Value/widgets';

  export let vnode;

  let ref;

  onMount(() => {
    mount(ref, vnode, render);
  });

  onDestroy(() => {
    unmount(ref);
  });
</script>

<div data-ref bind:this={ref} />
