import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import router from '../../core/Router';
import Router from '../Router';
import Route from '../Route';
import useRoute from '.';

/**
 * @returns {null}
 */
function MyComponent() {
  const { pathname } = useRoute();
  return pathname;
}

describe('useRoute()', () => {
  it('should use the parent route', async () => {
    const app = mount((
      <Router>
        <Route path="/myroute/:id">
          <MyComponent />
        </Route>
      </Router>
    ));

    expect(app.html()).toBe('/myroute/123');

    await act(async () => {
      await router.push({ to: '/myroute/456' });
    });

    app.update();

    expect(app.html()).toBe('/myroute/456');
  });
});
