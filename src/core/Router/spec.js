import router from './index';
import stack from '../Stack';
import emitter from '../emitter';
import * as constants from '../constants';
import * as errors from './errors';

const pathname1 = '/myroute/123';
const dateNowSpy = jest.spyOn(Date, 'now').mockImplementation(() => 123456);

describe('Router', () => {
  beforeEach(() => {
    stack.clear();
    router.constructor();
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

      // Get the new first id.
      const [newId] = stack.first();

      expect(history).not.toEqual(newHistory);
      expect(stack.getAll().size).toBe(1);
      expect(id).not.toBe(newId);
    });
  });

  describe('push()', () => {
    it('should resolve correctly', () => {
      const params = {
        to: `${pathname1}?s=phrase#what`,
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

        expect(router.history.location.pathname).toBe(pathname1);
        expect(router.history.location.search).toBe('?s=phrase');
        expect(router.history.location.state).toEqual(expect.objectContaining({
          route: {
            id: expect.any(String),
          },
          test: 123,
        }));
        expect(router.history.location.hash).toBe('#what');
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

    it('should update meta info when popping', async (done) => {
      await router.push({ to: '/myroute/456', meta: { hi: '123' } });
      await router.push({ to: '/myroute/789' });

      router.pop({ meta: { ho: '456' } }).then((result) => {
        expect(result.next.meta).toEqual({
          hi: '123',
          ho: '456',
        });
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
        meta: { hi: 5, ho: 123 },
      });
      await router.push({ to: '/myroute/789' });

      const meta = {
        ho: 456,
      };

      router.pop({ meta }).then(() => {
        const currentRoute = stack.getByIndex(router.currentIndex);
        expect(currentRoute.meta).toEqual({
          hi: 5,
          ho: 456,
        });
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
        meta: { test: '123' },
      });

      expect(stack.getAll().size).toBe(1);
      expect(result.prev.pathname).toBe('/myroute/456');
      expect(result.next.pathname).toBe('/myroute/789');
      expect(result.next.meta).toEqual({ test: '123' });
      expect(didCallback).toHaveBeenCalledWith({
        action: constants.REPLACE,
        next: result.next,
        prev: result.prev,
      });

      expect(router.history.location.pathname).toBe('/myroute/789');
      expect(router.history.location.state).toEqual(expect.objectContaining({
        route: {
          id: expect.any(String),
        },
        test: '123',
      }));
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

        expect(stack.getAll().size).toBe(2);
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

  describe('handleNativeEvent()', () => {
    it('should natively navigate backwards', async (done) => {
      await router.push({ to: '/somewhere' });
      await router.push({ to: '/somewhere/else' });
      const spyPop = jest.spyOn(router, 'handlePop');

      router.history.back();

      setTimeout(() => {
        expect(spyPop).toHaveBeenCalledTimes(1);
        done();
      }, 500);
    });

    it('should natively navigate forwards', async (done) => {
      const url = '/somewhere?hi=123#what';

      await router.push({ to: url });
      await router.pop();
      const spyPush = jest.spyOn(router, 'handlePush');

      router.history.forward();

      setTimeout(() => {
        expect(spyPush).toHaveBeenCalledTimes(1);
        expect(router.getCurrentRoute().location).toEqual(url);
        done();
      }, 500);
    });
  });
});
