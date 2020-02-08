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
    stack.clear();
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
      expect(typeof router.patterns[pattern1]).toBe('function');
    });

    it('should update initial entry when matching pattern is registered', () => {
      router.constructor();
      router.register(pattern1);
      const route = stack.first()[1];

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

  describe('handleNativeEvent()', () => {
    it('should natively navigate backwards', async (done) => {
      await router.push({ to: '/somewhere' });
      await router.push({ to: '/somewhere/else' });
      const spyPop = jest.spyOn(router, 'handlePop');

      router.history.goBack();

      setTimeout(() => {
        expect(spyPop).toHaveBeenCalledTimes(1);
        done();
      }, 500);
    });

    it('should natively navigate forwards', async (done) => {
      await router.push({ to: '/somewhere' });
      await router.pop();
      const spyPush = jest.spyOn(router, 'handlePush');

      router.history.goForward();

      setTimeout(() => {
        expect(spyPush).toHaveBeenCalledTimes(1);
        done();
      }, 500);
    });
  });

  describe('push()', () => {
    it('should resolve correctly', () => {
      const params = {
        to: `${pathname1}?s=phrase`,
        meta: {
          test: 123,
        },
      };

      const didCallback = jest.fn();

      emitter.once(constants.EVENT, didCallback);

      return router.push(params).then((result) => {
        expect(router.currentIndex).toBe(1);

        const [, route] = stack.last();

        expect(route.pathname).toBe(pathname1);
        expect(route.query).toEqual({ s: 'phrase' });
        expect(route.meta).toEqual({ test: 123 });

        expect(didCallback).toHaveBeenCalledWith({
          action: constants.PUSH,
          next: result.next,
          prev: result.prev,
        });

        expect(router.history.location.pathname).toBe(`${pathname1}?s=phrase`);
      });
    });

    it('should remove all forward routes from the stack', async () => {
      await router.push({ to: '/myroute/456' });
      await router.push({ to: '/myroute/789' });

      expect(stack.getAll().size).toBe(3);

      await router.pop({ steps: 2 });
      await router.push({ to: '/myroute/abc' });

      expect(router.currentIndex).toBe(1);
      expect(stack.getAll().size).toBe(2);
      expect(stack.getByIndex(1).pathname).toBe('/myroute/abc');
    });

    it('should reject when params are missing', () => (
      router.push().catch((error) => (
        expect(error).toEqual(new Error(errors.EPARAMSMISSING))
      ))
    ));

    it('should reject when params are empty', () => (
      router.push({}).catch((error) => (
        expect(error).toEqual(new Error(errors.EPARAMSEMPTY))
      ))
    ));

    it('should not emit didPush event', () => {
      const params = {
        to: pathname1,
        emit: false,
      };

      const callback = jest.fn();
      emitter.once(constants.event, callback);

      return router.push(params).then(() => {
        expect(callback).not.toHaveBeenCalled();
      });
    });

    it('should push when a non-matching pathname was given', (done) => {
      const params = {
        to: '/not-registered',
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

      await router.push({ to: '/myroute/456' });

      emitter.once(constants.EVENT, didCallback);

      router.pop().then((result) => {
        const route = stack.getByIndex(0);

        expect(stack.getAll().size).toBe(2);
        expect(router.currentIndex).toBe(0);
        expect(route).toEqual(result.next);
        expect(didCallback).toHaveBeenCalledWith({
          action: constants.POP,
          next: result.next,
          prev: result.prev,
        });
        expect(router.history.location.pathname).toBe(pathname1);

        done();
      });
    });

    it('should pop multiple routes', async (done) => {
      await router.push({ to: '/myroute/456' });
      await router.push({ to: '/myroute/789' });

      router.pop({ steps: 2 }).then((result) => {
        const currentRoute = stack.getByIndex(router.currentIndex);
        expect(currentRoute).toBe(result.next);
        done();
      });
    });

    it('should not pop when steps is negative', async () => {
      await router.push({ to: '/myroute/456' });
      await router.pop({ steps: -3 }).catch((error) => (
        expect(error).toEqual(new Error(errors.EINVALIDSTEPS))
      ));
    });

    it('should clamp when steps is larger than the stack', async (done) => {
      await router.push({ to: '/myroute/456' });
      await router.push({ to: '/myroute/789' });

      return router.pop({ steps: 5 }).then((result) => {
        expect(result.next).toBe(stack.getByIndex(0));
        done();
      });
    });

    it('should merge given state to incoming route', async (done) => {
      await router.push({
        to: '/myroute/456',
        state: { test: 123 },
      });
      await router.push({ to: '/myroute/789' });

      const meta = {
        test: 456,
      };

      router.pop({ meta }).then(() => {
        const currentRoute = stack.getByIndex(router.currentIndex);
        expect(currentRoute.meta).toEqual(meta);
        done();
      });
    });

    it('should not emit event', async () => {
      const callback = jest.fn();

      await router.push({ to: '/myroute/456' });

      emitter.once(constants.EVENT, callback);

      return router.pop({ emit: false }).then(() => {
        expect(callback).not.toHaveBeenCalled();
      });
    });
  });

  describe('replace()', () => {
    it('should replace correctly', async () => {
      const didCallback = jest.fn();
      emitter.once(constants.EVENT, didCallback);

      const result = await router.replace({
        to: '/myroute/789',
        meta: { test: 123 },
      });

      expect(stack.getAll().size).toBe(2);
      expect(result.next.pathname).toBe('/myroute/789');
      expect(result.next.meta).toEqual({ test: 123 });
      expect(didCallback).toHaveBeenCalledWith({
        action: constants.REPLACE,
        next: result.next,
        prev: result.prev,
      });
    });

    it('should reject when params are missing', () => (
      router.replace().catch((error) => (
        expect(error).toEqual(new Error(errors.EPARAMSMISSING))
      ))
    ));

    it('should reject when params are empty', () => (
      router.replace({}).catch((error) => (
        expect(error).toEqual(new Error(errors.EPARAMSEMPTY))
      ))
    ));

    it('should not emit didPush event', () => {
      const params = {
        to: pathname1,
        emit: false,
      };

      const callback = jest.fn();
      emitter.once(constants.EVENT, callback);

      return router.replace(params).then(() => {
        expect(callback).not.toHaveBeenCalled();
      });
    });

    it('should reject when pathname cannot be matched', () => {
      const params = {
        to: pathname1,
      };

      return router.replace(params).catch((error) => (
        expect(error).toEqual(new Error(errors.EINVALIDPATHNAME))
      ));
    });
  });

  describe('reset()', () => {
    it('should correctly reset to the first route', (done) => {
      const [, firstRoute] = stack.first();
      const didCallback = jest.fn();

      router.push({ to: '/myroute/456' });
      router.push({ to: '/myroute/789' });

      emitter.once(constants.EVENT, didCallback);

      const prevRoute = stack.getByIndex(router.currentIndex);
      const meta = { reset: true };

      router.reset({ meta }).then((result) => {
        expect(router.history.location.pathname).toBe(pathname1);
        expect(firstRoute).toBe(result.next);
        expect(result.next.meta).toEqual(meta);
        expect(prevRoute).toBe(result.prev);
        expect(didCallback).toHaveBeenCalledWith(result);
        done();
      });
    });

    it('should not reset when there is only one route', (done) => {
      const didCallback = jest.fn();
      emitter.once(constants.EVENT, didCallback);

      router.reset().catch(() => {
        expect(didCallback).not.toHaveBeenCalled();
        done();
      });
    });

    it('should correctly reset to the specified route', async (done) => {
      const didCallback = jest.fn();

      await router.push({ to: '/myroute/456' });

      emitter.once(constants.EVENT, didCallback);

      router.reset({ to: '/myroute/789' }).then((result) => {
        expect(result.prev.pathname).toBe('/myroute/456');
        expect(result.next.pathname).toBe('/myroute/789');

        expect(stack.getAll().size).toBe(3);
        expect(didCallback).toHaveBeenCalledWith(result);
        done();
      });
    });
  });

  describe('update()', () => {
    it('should correctly update/override a route`s state', async () => {
      const [id, route] = stack.last();
      const callback = jest.fn();
      emitter.once(constants.EVENT, callback);

      const meta = {
        test: 123,
      };

      await router.update(id, meta);
      expect(route.meta).toEqual(meta);
      expect(route.updated).toEqual(dateNowSpy());

      expect(callback).toHaveBeenCalledWith({
        action: constants.UPDATE,
        route,
      });

      await router.update(id, { test: 456 });
      expect(route.meta).toEqual({ test: 456 });
    });

    it('should reject when id is missing', () => {
      router.update().catch((error) => (
        expect(error).toEqual(new Error(errors.EPARAMSINVALID))
      ));
    });

    it('should reject when state is missing', () => {
      router.update(12345).catch((error) => (
        expect(error).toEqual(new Error(errors.EPARAMSINVALID))
      ));
    });

    it('should reject when state is empty', () => {
      router.update(12345, {}).catch((error) => (
        expect(error).toEqual(new Error(errors.EPARAMSINVALID))
      ));
    });

    it('should reject when id doesn`t match a route', () => {
      router.update(12345, { test: 123 }).catch((error) => (
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
