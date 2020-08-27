import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import router from '../../core/Router';
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
});
