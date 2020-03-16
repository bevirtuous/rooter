<script>
  import { history } from '../core';
  
  export let to;
  export let rel = '';
  export let replace = false;
  export let meta = {};

  function handleClick(event) {
    if (to) {
      const action = replace ? history.replace : history.push;
      action({ to, meta });
    }
  }
</script>

<a href={to} {rel} on:click on:click|preventDefault={handleClick}>
  <slot />
</a>
