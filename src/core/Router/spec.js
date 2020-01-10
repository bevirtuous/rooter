import router from './index';
import stack from '../Stack';
import emitter from '../emitter';
import * as constants from '../constants';
import * as errors from './errors';

const pathname1 = '/myroute/123';
const pattern1 = '/myroute/:id';
const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 123456);

describe('Router', () => {
  beforeEach(() => {
    stack.constructor();
    router.constructor();
    router.register(pattern1);
  });

  describe('constructor()', () => {
    it('should set an initial stack entry', () => {
      const [, entry] = stack.first();

      expect(stack.getAll().size).toBe(1);
      expect(entry.pathname).toBe(pathname1);
    });

    it('should make use of a given custom history', () => {
      // Get the initial first id.
      const [id] = stack.first();

      const { history } = router;

      router.constructor();
      const { history: newHistory } = router;
      router.register(pattern1);

      // Get the new first id.
      const [newId] = stack.first();

      expect(history).not.toEqual(newHistory);
      expect(stack.getAll().size).toBe(1);
      expect(id).not.toBe(newId);
    });
  });

  describe('register()', () => {
    it('should correctly register a pattern with a matching function', () => {
      expect(typeof router.patterns[pattern1].match).toBe('function');
    });

    it('should not register with missing pattern', () => {
      expect(router.register).toThrowError(errors.EMISSINGPATTERN);
    });

    it('should not register with invalid type', () => {
      expect(() => router.register(123)).toThrowError(errors.EINVALIDPATTERN);
    });

    it('should update initial entry when matching pattern is registered', () => {
      router.constructor();
      router.register(pattern1);
      const [, route] = stack.first();

      expect(route.pattern).toEqual(pattern1);
      expect(route.params).toEqual({ id: '123' });
    });
  });

  describe('deregister()', () => {
    it('should correctly deregister a pattern with', () => {
      router.register('/test');
      router.register('/test2');
      router.register('/test3');

      router.deregister('/test2');

      expect(router.patterns['/test']).toBeTruthy();
      expect(router.patterns['/test2']).toBeFalsy();
      expect(router.patterns['/test3']).toBeTruthy();
    });
  });

  describe('push()', () => {
    it('should resolve correctly', () => {
      const params = {
        pathname: `${pathname1}?s=phrase`,
        state: {
          test: 123,
        },
      };

      const didCallback = jest.fn();

      emitter.once(constants.ON_PUSH, didCallback);

      return router.push(params).then((result) => {
        expect(router.routeIndex).toBe(1);

        const [, route] = stack.last();

        expect(route.pathname).toBe(pathname1);
        expect(route.query).toEqual({ s: 'phrase' });
        expect(route.state).toEqual({ test: 123 });

        expect(didCallback).toHaveBeenCalledWith(result);

        expect(router.history.location.pathname).toBe(pathname1);
        expect(router.history.location.search).toBe('?s=phrase');
      });
    });

    it('should remove all forward routes from the stack', async () => {
      await router.push({ pathname: '/myroute/456' });
      await router.push({ pathname: '/myroute/789' });

      expect(stack.getAll().size).toBe(3);

      await router.pop({ steps: 2 });
      await router.push({ pathname: '/myroute/abc' });

      expect(router.routeIndex).toBe(1);
      expect(stack.getAll().size).toBe(2);
      expect(stack.getByIndex(1).pathname).toBe('/myroute/abc');
    });

    it('should reject when params are missing', () => (
      router.push().catch(error => (
        expect(error).toEqual(new Error(errors.EPARAMSMISSING))
      ))
    ));

    it('should reject when params are empty', () => (
      router.push({}).catch(error => (
        expect(error).toEqual(new Error(errors.EPARAMSEMPTY))
      ))
    ));

    it('should not emit didPush event', () => {
      const params = {
        pathname: pathname1,
        emit: false,
      };

      const callback = jest.fn();
      emitter.once(constants.ON_PUSH, callback);

      return router.push(params).then(() => {
        expect(callback).not.toHaveBeenCalled();
      });
    });

    it('should push when a non-matching pathname was given', (done) => {
      const params = {
        pathname: '/not-registered',
      };

      return router.push(params).then(async ({ next }) => {
        expect(next.pathname).toBe('/not-registered');
        expect(next.pattern).toBeNull();

        // Pop to remove the non-matching route for the next set of tests.
        await router.pop();
        done();
      });
    });
  });

  describe('pop()', () => {
    it('should resolve correctly', async (done) => {
      const didCallback = jest.fn();

      emitter.once(constants.ON_POP, didCallback);

      await router.push({ pathname: '/myroute/456' });

      router.pop().then((result) => {
        const route = stack.getByIndex(0);

        expect(stack.getAll().size).toBe(2);
        expect(router.routeIndex).toBe(0);
        expect(route).toEqual(result.next);
        expect(didCallback).toHaveBeenCalledWith(result);
        expect(router.history.location.pathname).toBe(pathname1);

        done();
      });
    });

    it('should pop multiple routes', async (done) => {
      await router.push({ pathname: '/myroute/456' });
      await router.push({ pathname: '/myroute/789' });

      router.pop({ steps: 2 }).then((result) => {
        const currentRoute = stack.getByIndex(router.routeIndex);
        expect(currentRoute).toBe(result.next);
        done();
      });
    });

    it('should not pop when steps is negative', async () => {
      await router.push({ pathname: '/myroute/456' });
      await router.pop({ steps: -3 }).catch(error => (
        expect(error).toEqual(new Error(errors.EINVALIDSTEPS))
      ));
    });

    it('should clamp when steps is larger than the stack', async (done) => {
      await router.push({ pathname: '/myroute/456' });
      await router.push({ pathname: '/myroute/789' });

      router.pop({ steps: 5 }).then((result) => {
        expect(result.next).toBe(stack.getByIndex(0));
        done();
      });
    });

    it('should merge given state to incoming route', async (done) => {
      await router.push({
        pathname: '/myroute/456',
        state: { test: 123 },
      });
      await router.push({ pathname: '/myroute/789' });

      const state = {
        test: 456,
      };

      router.pop({ state }).then(() => {
        const currentRoute = stack.getByIndex(router.routeIndex);
        expect(currentRoute.state).toEqual(state);
        done();
      });
    });

    it('should not emit didPop event', async () => {
      const callback = jest.fn();
      emitter.once(constants.ON_POP, callback);

      await router.push({ pathname: '/myroute/456' });

      return router.pop({ emit: false }).then(() => {
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });

  describe('replace()', () => {
    it('should replace correctly', (done) => {
      const didCallback = jest.fn();
      emitter.once(constants.ON_REPLACE, didCallback);

      router.replace({
        pathname: '/myroute/456',
        state: { test: 123 },
      }).then((result) => {
        const [, route] = stack.first();

        expect(stack.getAll().size).toBe(1);
        expect(route.pathname).toBe('/myroute/456');
        expect(route.state).toEqual({ test: 123 });
        expect(didCallback).toHaveBeenCalledWith(result);
        done();
      });
    });

    it('should reject when params are missing', () => (
      router.replace().catch(error => (
        expect(error).toEqual(new Error(errors.EPARAMSMISSING))
      ))
    ));

    it('should reject when params are empty', () => (
      router.replace({}).catch(error => (
        expect(error).toEqual(new Error(errors.EPARAMSEMPTY))
      ))
    ));

    it('should not emit didPush event', () => {
      const params = {
        pathname: pathname1,
        emit: false,
      };

      const callback = jest.fn();
      emitter.once(constants.ON_REPLACE, callback);

      return router.replace(params).then(() => {
        expect(callback).not.toHaveBeenCalled();
      });
    });

    it('should reject when pathname cannot be matched', () => {
      const params = {
        pathname: pathname1,
      };

      return router.replace(params).catch(error => (
        expect(error).toEqual(new Error(errors.EINVALIDPATHNAME))
      ));
    });
  });

  describe('reset()', () => {
    it('should correctly reset to the first route', (done) => {
      const [, firstRoute] = stack.first();
      const didCallback = jest.fn();

      emitter.once(constants.ON_RESET, didCallback);

      router.push({ pathname: '/myroute/456' });
      router.push({ pathname: '/myroute/789' });

      const prevRoute = stack.getByIndex(router.routeIndex);
      const state = { reset: true };

      router.reset(state).then((result) => {
        expect(router.history.location.pathname).toBe(pathname1);
        expect(firstRoute).toBe(result.next);
        expect(result.next.state).toEqual(state);
        expect(prevRoute).toBe(result.prev);
        expect(didCallback).toHaveBeenCalledWith(result);
        done();
      });
    });

    it('should not reset when there is only one route', (done) => {
      const didCallback = jest.fn();
      emitter.once(constants.ON_RESET, didCallback);

      router.reset().catch(() => {
        expect(didCallback).not.toHaveBeenCalled();
        done();
      });
    });
  });

  describe('resetTo()', () => {
    it('should correctly reset to the specified route', async (done) => {
      const didCallback = jest.fn();

      emitter.once(constants.ON_RESET, didCallback);

      await router.push({ pathname: '/myroute/456' });

      const previous = router.getCurrentRoute();

      router.resetTo('/myroute/789').then((result) => {
        const [, route] = stack.first();
        expect(route).toBe(result.next);
        expect(previous).toBe(result.prev);
        expect(route.pathname).toBe('/myroute/789');

        // Should contain the newly pushed route and the new first route.
        expect(stack.getAll().size).toBe(2);
        expect(didCallback).toHaveBeenCalledWith(result);
        done();
      });
    });

    it('should not reset when pathname is missing', () => (
      router.resetTo().catch(error => (
        expect(error).toEqual(new Error(errors.EMISSINGPATHNAME))
      ))
    ));

    it('should not reset to non-matching pathname', () => (
      router.resetTo('/invalid/path').catch(error => (
        expect(error).toEqual(new Error(errors.EINVALIDPATHNAME))
      ))
    ));
  });

  describe('update()', () => {
    it('should correctly update/override a route`s state', async () => {
      const [id, route] = stack.last();
      const callback = jest.fn();
      emitter.once(constants.ON_UPDATE, callback);

      const state = {
        test: 123,
      };

      await router.update(id, state);
      expect(route.state).toEqual(state);
      expect(route.updated).toEqual(dateNowSpy());

      expect(callback).toHaveBeenCalledWith(route);

      await router.update(id, { test: 456 });
      expect(route.state).toEqual({ test: 456 });
    });

    it('should reject when id is missing', () => {
      router.update().catch(error => (
        expect(error).toEqual(new Error(errors.EPARAMSINVALID))
      ));
    });

    it('should reject when state is missing', () => {
      router.update(12345).catch(error => (
        expect(error).toEqual(new Error(errors.EPARAMSINVALID))
      ));
    });

    it('should reject when state is empty', () => {
      router.update(12345, {}).catch(error => (
        expect(error).toEqual(new Error(errors.EPARAMSINVALID))
      ));
    });

    it('should reject when id doesn`t match a route', () => {
      router.update(12345, { test: 123 }).catch(error => (
        expect(error).toEqual(new Error(errors.EINVALIDID))
      ));
    });
  });

  describe('match()', () => {
    it('should match a pathname correctly', () => {
      expect(router.match('/myroute/123')).toBe(pattern1);
    });

    it('should not match a stranger pathname', () => {
      expect(router.match('/test/123')).toBe(false);
    });

    it('should not match when no pathname is given', () => {
      expect(router.match()).toBe(false);
    });
  });
});