import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import router from '../../core/Router';
import Router from '../Router';
import Route from '../Route';
import useParams from '.';

/**
 * @returns {null}
 */
function MyComponent() {
  const { id } = useParams();
  return id;
}

describe('useParams()', () => {
  it('should use the current route params', async () => {
    const app = mount((
      <Router>
        <Route path="/myroute/:id">
          <MyComponent />
        </Route>
      </Router>
    ));

    expect(app.html()).toBe('123');

    await act(async () => {
      await router.push({ to: '/myroute/456' });
    });

    app.update();
    expect(app.html()).toBe('456');
  });
});
