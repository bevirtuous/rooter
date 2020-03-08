import { writable } from 'svelte/store';
import { emitter, EVENT, UPDATE } from '../core';

const store = writable(null);

emitter.on(EVENT, (payload) => {
  if (payload.action === UPDATE) {
    store.set(payload);
  } else {
    store.set(payload.next);
  }
});

export default store;
