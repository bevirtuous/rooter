import Route from './index';

Date.now = () => 123456789;

describe('Route', () => {
  it('should correctly initialise', () => {
    const route = new Route({
      pathname: '/myroute/123?search=hello#headline',
      meta: {
        a: 1,
        b: 2,
      },
    });

    expect(route.location).toBe('/myroute/123?search=hello#headline');
    expect(route.pathname).toBe('/myroute/123');
    expect(route.query).toEqual({ search: 'hello' });
    expect(route.hash).toBe('headline');
    expect(route.meta).toEqual({ a: 1, b: 2 });
    expect(route.created).toEqual(123456789);
    expect(route.updated).toBeNull();
  });

  it('should trim whitespace from location', () => {
    const route = new Route({
      pathname: ' /myroute/123',
    });

    expect(route.pathname).toEqual('/myroute/123');
  });

  it('should set query and state to be empty when missing', () => {
    const route = new Route({
      pathname: '/myroute/123',
    });

    expect(route.query).toEqual({});
    expect(route.meta).toEqual({});
  });

  it('should set hash to be null when missing', () => {
    const route = new Route({
      pathname: '/myroute/123',
    });

    expect(route.hash).toBeNull();
  });
});

