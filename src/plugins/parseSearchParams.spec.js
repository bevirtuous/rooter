import parseSearchParams from './parseSearchParams';

describe('Plugins - parseSearchParams', () => {
  it('should correct parse query string', () => {
    expect(parseSearchParams('/my-route/123?foo=1&bar=2')).toEqual({
      foo: '1',
      bar: '2',
    });
  });

  it('should support query string settings', () => {
    expect(parseSearchParams('/my-route/123?foo=1&bar=2', { parseNumbers: true })).toEqual({
      foo: 1,
      bar: 2,
    });
  });
});
