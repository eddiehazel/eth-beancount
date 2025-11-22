import EmberRouter from '@ember/routing/router';
import config from 'eth-beancount/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  // Single page app - all routes handled by index
});
