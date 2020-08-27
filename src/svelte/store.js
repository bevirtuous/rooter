import { writable } from 'svelte/store';
import { history, UPDATE } from '../core';

const store = writable({});

history.listen((payload) => {
  if (payload.action === UPDATE) {
    store.set(payload.route);
  } else {
    store.set(payload.next);
  }
});

export default store;
