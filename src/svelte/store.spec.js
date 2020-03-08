import { get } from 'svelte/store';
import rooterStore from './store';
import { EVENT, UPDATE } from '../core/constants';
import emitter from '../core/emitter';

describe('svelte - store', () => {
  it('should update after rooter event', () => {
    emitter.emit(EVENT, { next: 12345 });

    expect(get(rooterStore)).toEqual(12345);
  });

  it('should update after rooter UPDATE event', () => {
    emitter.emit(EVENT, { action: UPDATE, route: 98765 });

    expect(get(rooterStore)).toEqual(98765);
  });
});
