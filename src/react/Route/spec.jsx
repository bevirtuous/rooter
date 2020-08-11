import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount } from 'enzyme';
import router from '../../core/Router';
import Router from '../Router/index';
import { RouteContext } from '../context';
import Route from './index';

const path = '/myroute/:id';

describe('<Route />', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('should render component', () => {
    const app = mount((
      <Router>
        <Route path={path} component={() => <div />} />
      </Router>
    ));

    expect(app).toMatchSnapshot();
  });

  it('should support children', () => {
    const app = mount((
      <Router>
        <Route path={path}>
          <div>Hello World.</div>
        </Route>
      </Router>
    ));

    expect(app).toMatchSnapshot();
  });

  it('should correctly set the RouteContext value', () => {
    let contextValue = null;
    const current = router.getCurrentRoute();
    const expected = {
      ...current,
      params: { id: '123' },
    };

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
        <Route path={path} component={MyComponent} />
      </Router>
    ));

    expect(expected).toMatchObject(contextValue);
  });

  it('should render null when does not match current route', () => {
    const route = mount((
      <Router>
        <Route path="/wrong" component={() => <div />} />
      </Router>
    ));

    expect(route.html()).toBe('');
  });

  it('should react to router events and update', async () => {
    const route = mount((
      <Router>
        <Route path={path} component={() => <div />} />
        <Route path="/other" component={() => <div />} />
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
