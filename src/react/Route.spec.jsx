import React from 'react';
import { act } from 'react-dom/test-utils';
import { mount, shallow } from 'enzyme';
import Route from './Route';
import useHistory from './useHistory';
import Router from './Router';

describe('React - <Route />', () => {
  it('should render when matched to history', () => {
    const app = shallow((
      <Route path="/myroute/:id">
        <div>Hello World.</div>
      </Route>
    ));

    expect(app).toMatchSnapshot();
  });

  it('should not render when not matched to history', () => {
    const app = shallow((
      <Route path="/myroute/:id/further">
        <div>Hello World.</div>
      </Route>
    ));

    expect(app.html()).toBeNull();
  });

  it('should only render when exact match is found', () => {
    const app = shallow((
      <Route path="/myroute" exact>
        <div>Hello World.</div>
      </Route>
    ));

    expect(app.html()).toBeNull();
  });

  it('should only render index when is exact match', () => {
    const app = shallow((
      <Route path="/">
        <div>Hello World.</div>
      </Route>
    ));

    expect(app.html()).toBeNull();
  });

  it('should react to history events', (done) => {
    const history = useHistory();
    const app = mount((
      <Router>
        <Route path="/myroute/:id">
          <div>First route</div>
        </Route>
        <Route path="/test">
          <div>Second route</div>
        </Route>
      </Router>
    ));

    expect(app.find(Route).at(0).html()).toBe('<div>First route</div>');
    expect(app.find(Route).at(1).html()).toBeNull();

    act(() => {
      history.push('/test');
    });

    setTimeout(() => {
      app.update();
      expect(app.find(Route).at(0).html()).toBeNull();
      expect(app.find(Route).at(1).html()).toBe('<div>Second route</div>');
      done();
    }, 1000);
  });
});
