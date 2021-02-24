import queryStringPlugin from './queryStringPlugin';

describe('Plugins - queryStringPlugin', () => {
  it('should correct parse query string', () => {
    const route = {
      location: '/my-route/123?foo=1&bar=2',
    };

    expect(queryStringPlugin()(route)).toEqual({
      foo: '1',
      bar: '2',
    });
  });

  it('should support query string settings', () => {
    const route = {
      location: '/my-route/123?foo=1&bar=2',
    };

    expect(queryStringPlugin({ parseNumbers: true })(route)).toEqual({
      foo: 1,
      bar: 2,
    });
  });
});
