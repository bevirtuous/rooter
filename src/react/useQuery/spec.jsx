import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import router from '../../core/Router';
import Router from '../Router';
import Route from '../Route';
import useQuery from '.';

/**
 * @returns {null}
 */
function MyComponent() {
  const { hi = null } = useQuery();
  return hi;
}

describe('useQuery()', () => {
  it('should use the current route query', async () => {
    const app = mount((
      <Router>
        <Route path="/myroute/:id">
          <MyComponent />
        </Route>
      </Router>
    ));

    expect(app.html()).toBe('');

    await act(async () => {
      await router.push({ to: '/myroute/456?hi=5' });
    });

    app.update();
    expect(app.html()).toBe('5');
  });
});
