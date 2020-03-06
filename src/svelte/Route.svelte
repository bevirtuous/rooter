<script>
  import { register } from '../core';
  import store from './store';

  export let component;
  export let path;

  register(path);
</script>

{#if $store.current && path === $store.current.pattern}
  <svelte:component this={component} />
{/if}
