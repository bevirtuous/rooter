import { writable } from 'svelte/store';
import router from '../core/Router';
import emitter from '../core/emitter';
import { EVENT, UPDATE } from '../core/constants';

const store = writable({
  previous: null,
  current: router.getCurrentRoute(),
});

emitter.on(EVENT, (payload) => {
  if (payload.action === UPDATE) {
    store.update((v) => ({
      ...v,
      current: payload,
    }));
  } else {
    store.set({
      current: payload.next,
      previous: payload.prev ? payload.prev : null,
    });
  }
});

export default store;
