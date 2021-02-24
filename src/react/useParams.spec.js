import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import useParams from './useParams';
import Context from './context';

describe('React - useParams', () => {
  it('should return params', () => {
    const wrapper = ({ children }) => (
      <Context.Provider value={{ pattern: '/myroute/:id' }}>
        {children}
      </Context.Provider>
    );
    const { result } = renderHook(() => useParams(), { wrapper });

    expect(result.current).toEqual({
      id: '123',
    });
  });

  it('should return {} when no params available', () => {
    const wrapper = ({ children }) => (
      <Context.Provider value={{ pattern: '/myroute/123' }}>
        {children}
      </Context.Provider>
    );
    const { result } = renderHook(() => useParams(), { wrapper });

    expect(result.current).toEqual({});
  });
});
