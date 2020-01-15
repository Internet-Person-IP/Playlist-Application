
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router } from "react-router-dom";
import Amplify from "aws-amplify";
import config from "./config";

/*
Root of the project the GraphQL API and Cognito Authentication is configured here.
I have a config file where I store all of the enviroment variables for the project.

*/
Amplify.configure({
  Auth: {
    mandatorySignIn: true,
    region: config.cognito.REGION,
    userPoolId: config.cognito.USER_POOL_ID,
    identityPoolId: config.cognito.IDENTITY_POOL_ID,
    userPoolWebClientId: config.cognito.APP_CLIENT_ID
  },
  "aws_appsync_graphqlEndpoint": config.graphQL.ENDPOINT,
  "aws_appsync_region": config.graphQL.REGION,
  "aws_appsync_authenticationType": config.graphQL.AUTHENTICATION_TYPE,
  "aws_appsync_apiKey": config.graphQL.API_KEY
});


ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
