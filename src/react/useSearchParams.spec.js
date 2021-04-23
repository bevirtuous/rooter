import { renderHook } from '@testing-library/react-hooks';
import useSearchParams from './useSearchParams';
import store from './store';

describe('React - useSearchParams', () => {
  beforeAll(() => {
    const { push } = store.getState();
    push({
      pathname: '/second/route',
      search: '?hi=5&ho=okay',
      hash: '',
      key: '#2',
    });
  });

  it('should return search params', () => {
    const { result } = renderHook(() => useSearchParams());

    expect(result.current).toEqual({
      hi: '5',
      ho: 'okay',
    });
  });

  it('should allow query parsing options', () => {
    const { result } = renderHook(() => useSearchParams({ parseNumbers: true }));

    expect(result.current.hi).toEqual(5);
  });
});
