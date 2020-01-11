import React from 'react';
import PropTypes from 'prop-types';
import router from '../../core/Router';
import RouteNotFound from '../404';
import { RouteContext, RouterContext } from '../context';

class Route extends React.Component {
  constructor(props) {
    super(props);
    router.register(props.path);
  }

  render() {
    const { children, path } = this.props;
    const route = router.getCurrentRoute();

    if (route.pattern !== path) {
      return null;
    }

    const key = `${route.id}-${route.pathname}`;

    return (
      <RouteContext.Provider key={key} value={route}>
        {children}
      </RouteContext.Provider>
    );
  }
}

Route.contextType = RouterContext;
Route.NotFound = RouteNotFound;
Route.propTypes = {
  children: PropTypes.node.isRequired,
  path: PropTypes.string.isRequired,
};

export default Route;
