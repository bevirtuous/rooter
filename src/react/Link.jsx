import React from 'react';
import useHistory from './useHistory';

function Link({ to, state = {}, onClick, ...otherProps }) {
  const history = useHistory();

  function handleClick(event) {
    event.preventDefault();

    history.push(to, state);

    onClick && onClick(event);
  }

  return (
    <a {...otherProps} href={to} onClick={handleClick} />
  );
}

export default Link;
