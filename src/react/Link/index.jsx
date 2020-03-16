import React from 'react';
import { history } from '../../core';

function Link({ children, to, meta = {}, replace = false, onClick, ...other }) {
  function handleClick(event) {
    event.preventDefault();

    if (to) {
      const action = replace ? history.replace : history.push;

      action({ to, meta });

      if (typeof onClick === 'function') {
        onClick(event);
      }
    }
  }

  return (
    <a {...other} href={to} onClick={handleClick}>{children}</a>
  );
}

export default Link;
