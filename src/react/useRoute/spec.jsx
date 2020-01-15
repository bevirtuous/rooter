import React from 'react';
import { render } from '@testing-library/react';
import router from '../../core/Router';
import stack from '../../core/Stack';
import Router from '../Router';
import Route from '../Route';
import useRoute from '.';

let useRoute1 = null;

function MyComponent() {
  useRoute1 = useRoute();
  return null;
}

describe('useRoute()', () => {
  it('should use the parent route', () => {
    render((
      <Router>
        <Route path="/myroute/123">
          <MyComponent />
        </Route>
      </Router>
    ));

    const route = stack.getByIndex(router.currentIndex);

    expect(useRoute1).toMatchObject({
      ...route,
      update: expect.any(Function),
    });

    // Ensure that the used context id was updated when a route's meta was updated.
    const newMeta = {
      hi: 5,
    };

    useRoute1.update(newMeta);

    expect(stack.get(useRoute1.id).meta).toEqual({ hi: 5 });
  });
});
