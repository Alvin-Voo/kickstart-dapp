const routes = require('next-routes')(); //this is a function

routes
.add('/campaigns/new','/campaigns/new')
.add('/campaigns/:address','/campaigns/show')
.add('/campaigns/:address/requests','/campaigns/requests')
.add('/campaigns/:address/requests/new','/campaigns/requests/new');

module.exports = routes;
