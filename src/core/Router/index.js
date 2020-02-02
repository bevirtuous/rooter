import Route from '../Route';
import * as errors from './errors';
import emitter from '../emitter';
import history from '../history';
import matcher from '../matcher';
import stack from '../Stack';
import * as constants from '../constants';

class Router {
  constructor(createHistory = history) {
    // Flag to indicate a native history event. Should always be reset to true.
    this.nativeEvent = true;

    this.history = createHistory();

    // The patterns are collected to match against pathnames.
    this.patterns = {};

    // The `currentIndex` is used to track which stack entry is the current route.
    this.currentIndex = 0;

    this.action = constants.PUSH;

    // Unsubscribe to any other history module changes.
    if (typeof this.historyListener === 'function') {
      this.historyListener();
      stack.clear();
    }

    this.addInitialRoute();

    this.historyListener = this.history.listen(this.handleNativeEvent);
  }

  handleNativeEvent = (location, action) => {
    if (!this.nativeEvent) {
      return;
    }

    const next = stack.getByIndex(this.currentIndex + 1);

    if (next && location.state && location.state.route && next.id === location.state.route.id) {
      this.handlePush({
        to: location.pathname,
        meta: location.state,
      }, false, true);

      return;
    }

    if (action === constants.POP) {
      this.handlePop();
    }
  }

  /**
   * Populate the stack with an initial entry to match the history module.
   * Note: we cannot match it against a pattern at this point.
   */
  addInitialRoute = () => {
    const { hash, pathname, search } = this.history.location;
    const fullPathname = `${pathname}${search}${hash}`;
    const route = new Route({ pathname: fullPathname });

    stack.add(route.id, route);
  }

  /**
   * @param {Object} params The router action params.
   * @returns {Promise}
   */
  handlePop = (params = {}) => new Promise((resolve, reject) => {
    const {
      emit = true,
      forceNative = false,
      steps = 1,
      meta = null,
    } = params;
    let unlisten = null;

    if (steps <= 0) {
      reject(new Error(errors.EINVALIDSTEPS));
      this.nativeEvent = true;
      return;
    }

    // Get id of target route.
    const targetIndex = Math.max(this.currentIndex - steps, 0);
    const prev = stack.getByIndex(this.currentIndex);
    const next = stack.getByIndex(targetIndex);

    if (meta) {
      next.meta = Object.assign(next.meta, meta);
    }

    const end = { action: constants.POP, prev, next };

    /**
     *
     */
    const callback = () => {
      unlisten();
      this.currentIndex = targetIndex;
      this.action = constants.POP;

      if (emit) {
        emitter.emit(constants.EVENT, end);
      }

      resolve(end);
      this.nativeEvent = true;
    };

    /**
     * Create a reference to the history listener
     * to be able to unsubscribe from inside the callback.
     */
    unlisten = this.history.listen(callback);

    // Perform the history back action.
    if (forceNative || !this.nativeEvent) {
      this.history.go(steps * -1);
    } else {
      callback();
    }
  });

  /**
   * @param {Object} params The params to use when navigating.
   * @param {boolean} [cleanStack=true] When true, the overhanging routes will be removed.
   * @param {boolean} [nativePush=false] When true, the process of adding a route to
   * the stack is skipped.
   * @returns {Promise}
   */
  handlePush(params, cleanStack = true, nativePush = false) {
    return new Promise((resolve, reject) => {
      // Check for missing parameters.
      if (!params) {
        reject(new Error(errors.EPARAMSMISSING));
        this.nativeEvent = true;
        return;
      }

      // Check for empty params.
      if (Object.keys(params).length === 0) {
        reject(new Error(errors.EPARAMSEMPTY));
        this.nativeEvent = true;
        return;
      }

      const {
        emit = true,
        meta,
        to,
      } = params;
      const pattern = this.findPattern(to.split('?')[0]);
      let unlisten = null;

      // Remove all unwanted items from the stack.
      if (cleanStack) {
        while (this.currentIndex < stack.getAll().size - 1) {
          const [id] = stack.last();
          stack.remove(id);
        }
      }

      const prev = stack.getByIndex(this.currentIndex);
      const next = nativePush ? stack.getByIndex(this.currentIndex + 1) : new Route({
        pathname: to,
        pattern,
        meta,
      });

      if (!nativePush) {
        // Add item to the stack
        stack.add(next.id, next);
      }

      /**
       * The history event callback.
       */
      const callback = () => {
        // Unsubscribe from the history events.
        unlisten();

        // Increment the route index.
        this.currentIndex += 1;

        this.action = constants.PUSH;

        // Emit completion event.
        if (emit) {
          emitter.emit(constants.EVENT, { action: constants.PUSH, prev, next });
        }

        // Resolve the Promise.
        resolve({ prev, next });
        this.nativeEvent = true;
      };

      /**
       * Create a reference to the history listener
       * to be able to unsubscribe from inside the callback.
       */
      unlisten = this.history.listen(callback);

      // Perform the history push action.
      if (!this.nativeEvent) {
        this.history.push({
          pathname: to,
          state: {
            ...meta,
            route: { id: next.id },
          },
        });
      } else {
        callback();
      }
    });
  }

  /**
   * Match the given pathname to a registered pattern.
   * @param {string} pathname The pathname to match.
   * @returns {string|null}
   */
  findPattern = (pathname) => {
    const pattern = Object.keys(this.patterns).find((key) => this.patterns[key].match(pathname));
    return pattern || null;
  }

  /**
   * Registers a route pattern to match new pathnames against.
   * @param {string} pattern The pattern to register.
   */
  register = (pattern) => {
    if (!pattern) {
      throw new Error(errors.EMISSINGPATTERN);
    }

    if (typeof pattern !== 'string') {
      throw new Error(errors.EINVALIDPATTERN);
    }

    const match = matcher(pattern);

    this.patterns[pattern] = {
      match,
    };

    // Find the pathname of the first route.
    const route = stack.first()[1];

    // If it has been set then we don't need to match it.
    if (route.pattern !== null) {
      return;
    }

    //
    if (match(route.pathname)) {
      route.setPattern(pattern);

      const next = { action: constants.PUSH, prev: null, next: route };

      emitter.emit(constants.EVENT, next, true);
    }
  }

  deregister = (pattern) => {
    delete this.patterns[pattern];
  }

  handleReplace = (params) => new Promise((resolve, reject) => {
    // Check for missing parameters.
    if (!params) {
      reject(new Error(errors.EPARAMSMISSING));
      this.nativeEvent = true;
      return;
    }

    // Check for empty params.
    if (Object.keys(params).length === 0) {
      reject(new Error(errors.EPARAMSEMPTY));
      this.nativeEvent = true;
      return;
    }

    const {
      emit = true,
      to,
      meta,
    } = params;
    const pattern = this.findPattern(to.split('?')[0]);
    let unlisten = null;

    const { id } = stack.getByIndex(this.currentIndex);
    const prev = stack.get(id);
    const next = new Route({
      pathname: to,
      pattern,
      meta,
    });
    const end = { action: constants.REPLACE, prev, next };

    // Add item to the stack.
    stack.add(id, next);

    /**
     * The history event callback.
     */
    const callback = () => {
      // Unsubscribe from the history events.
      unlisten();

      this.action = constants.REPLACE;

      // Emit completion event.
      if (emit) {
        emitter.emit(constants.EVENT, end);
      }

      resolve(end);
      this.nativeEvent = true;
    };

    /**
     * Create a reference to the history listener
     * to be able to unsubscribe from inside the callback.
     */
    unlisten = this.history.listen(callback);

    // Perform the history replace action.
    if (!this.nativeEvent) {
      this.history.replace({
        pathname: to,
        state: {
          ...meta,
          route: { id },
        },
      });
    } else {
      callback();
    }
  })

  /**
   * @param {Object} params The params when routing.
   * @returns {Promise}
   */
  push = (params) => {
    this.nativeEvent = false;
    return this.handlePush(params);
  }

  /**
   * @param {Object} params The params when routing.
   * @returns {Promise}
   */
  pop = (params) => {
    this.nativeEvent = false;
    return this.handlePop(params);
  }

  /**
   * @param {Object} params The params when routing.
   * @returns {Promise}
   */
  replace = (params) => {
    this.nativeEvent = false;
    return this.handleReplace(params);
  }

  /**
   * @returns {Promise}
   */
  reset = ({ to = null, meta = null } = {}) => new Promise((resolve, reject) => {
    if (this.currentIndex === 0) {
      reject();
      return;
    }

    this.nativeEvent = false;
    const route = stack.first()[1];

    const prev = stack.getByIndex(this.currentIndex);
    const next = {
      action: constants.RESET,
      prev,
      next: route,
    };

    if (meta) {
      this.update(route.id, meta, false);
    }

    const params = {
      emit: false,
      forceNative: true,
      steps: this.currentIndex,
    };

    this.handlePop(params)
      .then(() => {
        if (!to) {
          emitter.emit(constants.EVENT, next);
          this.nativeEvent = true;
          resolve(next);
          return;
        }

        this.handleReplace({ to, meta, emit: false }).then(() => {
          next.next = stack.first()[1];

          this.nativeEvent = true;
          emitter.emit(constants.EVENT, next);
          resolve(next);
        });
      });
  });

  /**
   * @param {string} id The route id to update.
   * @param {Object} meta The new meta.
   * @param {boolean} emit When true, will emit when the meta was updated.
   * @returns {Promise}
   */
  update = (id, meta = {}, emit = true) => new Promise((resolve, reject) => {
    if (!id || Object.keys(meta).length === 0) {
      reject(new Error(errors.EPARAMSINVALID));
      return;
    }

    const route = stack.get(id);

    if (!route) {
      reject(new Error(errors.EINVALIDID));
      return;
    }

    route.meta = Object.assign(route.meta, meta);
    route.updated = Date.now();

    stack.update(id, route);

    if (emit) {
      emitter.emit(constants.EVENT, { action: constants.UPDATE, route });
    }

    resolve(route);
  });

  /**
   * @returns {Route}
   */
  getCurrentRoute = () => stack.getByIndex(this.currentIndex)

  /**
   * Returns the matches pattern for the given pathname.
   * @param {string} pathname The pathname to match.
   * @returns {string|null}
   */
  match = (pathname = null) => {
    if (!pathname) {
      return false;
    }

    let foundPattern = false;

    Object.entries(this.patterns).some(([pattern, properties]) => {
      if (properties.match(pathname)) {
        foundPattern = pattern;
        return true;
      }

      return false;
    });

    return foundPattern;
  }
}

export default new Router();
