import React from 'react';
import { shallow } from 'enzyme';
import Router from './Router';

describe('React - <Router />', () => {
  it('should render children', () => {
    const app = shallow((
      <Router>
        <div>Hello World.</div>
      </Router>
    ));

    expect(app).toMatchSnapshot();
  });
});
