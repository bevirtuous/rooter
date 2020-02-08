import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import router from '../../core/Router';
import Router from '../Router/index';
import { RouteContext } from '../context';
import Route from './index';

const path = '/myroute/:id';
const spy = jest.spyOn(router, 'register');

describe('<Route />', () => {
  it('should render component', () => {
    const app = mount((
      <Router>
        <Route path={path}>
          <div />
        </Route>
      </Router>
    ));

    expect(spy).toHaveBeenCalledWith(path);
    expect(app).toMatchSnapshot();
  });

  it('should correctly set the RouteContext value', () => {
    let contextValue = null;
    const current = router.getCurrentRoute();

    const MyComponent = () => (
      <RouteContext.Consumer>
        {(route) => {
          contextValue = route;
          return null;
        }}
      </RouteContext.Consumer>
    );

    mount((
      <Router>
        <Route path={path}>
          <MyComponent />
        </Route>
      </Router>
    ));

    expect(current).toMatchObject(contextValue);
  });

  it('should render null when does not match current route', () => {
    const route = mount((
      <Router>
        <Route path="/wrong">
          <div />
        </Route>
      </Router>
    ));

    expect(route.html()).toBe('');
  });

  it('should react to router events and update', async () => {
    const route = mount((
      <Router>
        <Route path={path}>
          <div />
        </Route>
        <Route path="/other">
          <div />
        </Route>
      </Router>
    ));

    // Should initially render the component (match found).
    expect(route.find(Route).at(0).html()).toBe('<div></div>');
    expect(route.find(Route).at(1).html()).toBeNull();

    await act(async () => {
      await router.push({ to: '/other' });
    });

    route.update();

    // Should now render null (first route does not match).
    expect(route.find(Route).at(0).html()).toBeNull();
    expect(route.find(Route).at(1).html()).toBe('<div></div>');
  });
});
