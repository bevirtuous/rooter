<script>
  import { register } from '../core';
  import store from './store';

  export let component;
  export let path;

  register(path);
</script>

{#if $store && path === $store.pattern}
  <svelte:component this={component} />
{/if}
