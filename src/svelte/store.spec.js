import { get } from 'svelte/store';
import rooterStore from './store';
import { history } from '../core';

describe('svelte - store', () => {
  it('should update after rooter event', () => {
    history.push({ to: '/hello ' });

    expect(get(rooterStore)).toEqual(expect.objectContaining({
      hash: null,
      id: expect.any(String),
      location: '/hello',
      meta: {},
      pathname: '/hello',
      query: {},
    }));
  });
});
