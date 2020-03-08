import { writable } from 'svelte/store';
import { emitter, EVENT, UPDATE } from '../core';

const store = writable({});

emitter.on(EVENT, (payload) => {
  if (payload.action === UPDATE) {
    store.set(payload.route);
  } else {
    store.set(payload.next);
  }
});

export default store;
