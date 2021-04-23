import { renderHook } from '@testing-library/react-hooks';
import history from 'history/browser';
import store from './store';
import useRouter from './useRouter';

describe('React - useRouter', () => {
  it('should sync with history push', (done) => {
    renderHook(() => useRouter());

    history.push('/hello');

    setTimeout(() => {
      expect(store.getState().current).toBe(1);
      expect(store.getState().routes.length).toBe(2);
      expect(store.getState().routes[store.getState().current].pathname).toBe('/hello');
      done();
    }, 500);
  });

  it('should sync with history back', (done) => {
    renderHook(() => useRouter());

    history.back();

    setTimeout(() => {
      expect(store.getState().current).toBe(0);
      expect(store.getState().routes.length).toBe(2);
      expect(store.getState().routes[store.getState().current].pathname).toBe('/myroute/123');
      done();
    }, 500);
  });
});
