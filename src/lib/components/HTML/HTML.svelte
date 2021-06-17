<script>
  import { onMount, onDestroy } from 'svelte';
  import {
    $ as render, patch, mount, unmount,
  } from '../Value/widgets';

  export let vnode;

  let dirty;
  let prev;
  let ref;

  onMount(() => {
    mount(ref, prev = vnode, render);
  });

  onDestroy(() => {
    unmount(ref);
  });

  $: if (prev && prev !== vnode) {
    patch(ref, prev, prev = vnode, render);
  }
</script>

<div data-ref bind:this={ref} />
