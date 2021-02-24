import { renderHook } from '@testing-library/react-hooks';
import usePath from './usePath';

describe('React - usePath', () => {
  it('should match', () => {
    const { result } = renderHook(() => usePath('/myroute/:id'));

    expect(result.current.isMatch).toBe(true);
    expect(result.current.isExactMatch).toBe(true);
  });

  it('should loosely match', () => {
    const { result } = renderHook(() => usePath('/myroute'));

    expect(result.current.isMatch).toBe(true);
    expect(result.current.isExactMatch).toBe(false);
  });

  it('should exactly match route index', () => {
    const { result } = renderHook(() => usePath('/'));

    expect(result.current.isMatch).toBe(false);
    expect(result.current.isExactMatch).toBe(false);
  });
  
  it('should expose params', () => {
    const { result } = renderHook(() => usePath('/myroute/:id'));

    expect(result.current.params).toEqual({ id: '123' });
  });
  
  it('should not match', () => {
    const { result } = renderHook(() => usePath('/other'));

    expect(result.current.isMatch).toBe(false);
    expect(result.current.isExactMatch).toBe(false);
  });
});
