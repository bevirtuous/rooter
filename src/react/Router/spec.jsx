import React from 'react';
import { mount } from 'enzyme';
import router from '../../core/Router';
import Router from './index';

const spy = jest.spyOn(router, 'constructor');

describe('<Router />', () => {
  it('should render with children and context', () => {
    const app = mount((
      <Router>
        <p />
      </Router>
    ));

    expect(app).toMatchSnapshot();
  });

  it('should pass the history function to core', () => {
    const mockHistory = () => ({
      listen: () => {},
      location: {},
    });

    mount((
      <Router history={mockHistory}>
        <p />
      </Router>
    ));

    expect(spy).toHaveBeenCalledWith(mockHistory);
  });
});
