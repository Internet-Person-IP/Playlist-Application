import React, { Component } from "react";
import { Auth } from "aws-amplify";
import "./Login.css";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import { API, graphqlOperation} from "aws-amplify";// Ska vara queries
import {listUserPlaylists} from "../graphql/queries.js";
export default class Login extends Component {
/*
Pretty Basic Loggin page. This is a bootstrap 3 template Loggin which I used
for the login into the applicaton. When the person is authenticated the person is
then redirected to the Home Page.
*/
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      email: "",
      password: ""
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }
  /*
  This is the most important part of the application. 
  It is how I sign in and how I initiate alot of the "global state"
  I used Async await since alot of the data is dependent on each other 
  for the initial setup therefore promises would become quite messy.
  */
  handleSubmit = async event => {
  event.preventDefault();
  this.setState({ isLoading: true });
  try {
    //Sign into the Cognito
    await Auth.signIn(this.state.email, this.state.password);

    /*
    Save the user since the user.username gives the CognitoID which is used
    for fetching the UserID.
    */
    const user=await Auth.currentAuthenticatedUser({bypassCache: false});
    this.props.setCognitoID(user.username);
    /*
    UserID is stored in the "Global state " since it helps with finding the
    playlists from the GraphQL API.
    */

    const userIDData= await API.graphql(graphqlOperation(listUserPlaylists, {CognitoID:user.username}));
    this.props.setUserID(userIDData.data.listUserPlaylistss.items[0].id);
    this.props.userHasAuthenticated(true);

    //Sends users back to the homepage
    this.props.history.push("/");
  } catch (e) {
    alert(e.message);
    this.setState({
      isLoading: false
    })
  }
}



  render() {
    return (
      <div className="Login">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <LoaderButton
          block
          bsSize="large"
          disabled={!this.validateForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Login"
          loadingText="Logging in…"
/>

        </form>
      </div>
    );
  }
}
