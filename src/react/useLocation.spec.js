import { renderHook } from '@testing-library/react-hooks';
import useLocation from './useLocation';

describe('React - useLocation', () => {
  it('should return current location', () => {
    const { result } = renderHook(() => useLocation());

    expect(result.current).toMatchSnapshot();
  });
});
