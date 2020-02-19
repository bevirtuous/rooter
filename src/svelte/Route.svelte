<script>
  import router from '../core/Router';
  import store from './store';

  export let component;
  export let path;

  const Component = component;

  router.register(path);
</script>

{#if path === $store.current.pattern}
  <Component />
{/if}
