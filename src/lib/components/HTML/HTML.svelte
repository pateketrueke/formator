<script>
  import { onMount, onDestroy } from 'svelte';

  export let children;
  export let markup;

  let ref;

  onMount(() => {
    if (Array.isArray(children)) {
      children.forEach(element => {
        if (element instanceof Element) {
          ref.appendChild(element);
        }
      });
    }

    if (typeof markup === 'string') {
      ref.innerHTML = markup;
    }
  });

  onDestroy(() => {
    while (ref.firstChild) ref.removeChild(ref.firstChild);
  });
</script>

<div bind:this={ref} />
