import React from "react";
import { Route, Switch } from "react-router-dom";
import Home from "./containers/Home";
import NotFound from "./containers/NotFound";
import Login from "./containers/Login";
import AppliedRoute from "./components/AppliedRoute";
import Signup from "./containers/Signup";
import NewPlaylist from "./containers/NewPlaylist";
import Playlist from "./containers/Playlist"
/*
Applied Routes was created to make it simpler to send props from App.js
to the children.

*/
export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path="/" exact component={Home} props={childProps} />
    <AppliedRoute path="/playlist/:id" component={Playlist} props={childProps} />
    <AppliedRoute path="/login" component={Login} props={childProps} />
    <AppliedRoute path="/signup" component={Signup} props={childProps} />
    <AppliedRoute path="/playlists" component={NewPlaylist} props={childProps} />
    { /* Finally, catch all unmatched routes */ }
    <Route component={NotFound} />
  </Switch>;

