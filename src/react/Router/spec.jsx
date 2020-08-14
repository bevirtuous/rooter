import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import emitter from '../../core/emitter';
import router from '../../core/Router';
import { EVENT } from '../../core/constants';
import Router from './index';
import useHistory from '../useHistory';

describe('<Router />', () => {
  it('should render with children and context', () => {
    const app = mount((
      <Router>
        <p />
      </Router>
    ));

    expect(app).toMatchSnapshot();
  });

  it('should unsubscribe when unmounted', () => {
    emitter.removeAllListeners([EVENT]);

    const app = mount((
      <Router>
        <p />
      </Router>
    ));

    expect(emitter.listenerCount(EVENT)).toBe(1);
    app.unmount();
    expect(emitter.listenerCount(EVENT)).toBe(0);
  });

  it('should update on navigation action', async () => {
    const MyComponent = () => useHistory().current.pathname;

    const app = mount((
      <Router>
        <MyComponent />
      </Router>
    ));

    expect(app.html()).toBe('/myroute/123');

    await act(async () => {
      await router.push({ to: '/myroute/456' });
    });

    app.update();

    expect(app.html()).toBe('/myroute/456');
  });

  it('should update on route update', async () => {
    const MyComponent = () => useHistory().current.meta.test;

    await act(async () => {
      await router.push({ to: '/myroute/456', meta: { test: 123 } });
    });

    const app = mount((
      <Router>
        <MyComponent />
      </Router>
    ));

    const { id } = router.getCurrentRoute();

    expect(app.html()).toBe('123');

    await act(async () => {
      await router.update(id, { test: 789 });
    });

    app.update();

    expect(app.html()).toBe('789');
  });
});
