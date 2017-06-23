import React from "react";
import { Route, IndexRoute, Router, browserHistory } from "react-router";


import Main from "../components/Main";
import Signup from "../components/Signup";
import Combiner from "../components/Combiner";

// Using just one route for now
// NOTE: browserHistory only works when run with a server
// build the webpack project, start the server, and navigate to localhost:3000
const routes = (
  <Router history={browserHistory}>
    <Route path="/" component={Main}>
      {/* If user selects either Login or Signup */}
      <Route path="Signup" component={Signup} />
      
      
      {/* If user selects Search or Saved show the appropriate component */}
      <IndexRoute component={Combiner} />
      
    </Route>
  </Router>
);

export default routes;
