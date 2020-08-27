import { writable } from 'svelte/store';
import { history } from '../core';

const store = writable({});

history.listen((payload) => {
  store.set(payload.next);
});

export default store;
