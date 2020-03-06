import { writable } from 'svelte/store';
import { emitter, EVENT, UPDATE } from '../core';

const store = writable({
  previous: null,
  current: null,
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
