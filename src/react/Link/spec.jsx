import React from 'react';
import { shallow } from 'enzyme';
import { history } from '../../core';
import Link from './index';

const spy = jest.spyOn(history, 'push');
const event = {
  preventDefault: jest.fn(),
};

describe('<Link />', () => {
  beforeEach(() => {
    spy.mockClear();
  });

  it('should open link with `to` and `meta`', () => {
    const app = shallow((
      <Link to="/here" meta={{ hi: 123 }}>My Link</Link>
    ));

    app.simulate('click', event);

    expect(app).toMatchSnapshot();
    expect(spy).toHaveBeenCalledWith({
      to: '/here',
      meta: { hi: 123 },
    });
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should call the onClick callback', () => {
    const callback = jest.fn();
    const app = shallow((
      <Link to="/here" onClick={callback}>My Link</Link>
    ));

    app.simulate('click', event);

    expect(callback).toHaveBeenCalledWith(event);
  });

  it('should use `history.replace`', () => {
    const replaceSpy = jest.spyOn(history, 'replace');
    const app = shallow((
      <Link to="/here" replace>My Link</Link>
    ));

    app.simulate('click', event);

    expect(replaceSpy).toHaveBeenCalled();
  });

  it('should not use history when `to` is missing', () => {
    const app = shallow((
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      <Link>My Link</Link>
    ));

    app.simulate('click', event);

    expect(spy).not.toHaveBeenCalled();
  });
});
