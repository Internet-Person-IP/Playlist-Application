import React, { Component } from "react";
import { Auth, API, graphqlOperation} from "aws-amplify";
import {createUserPlaylists} from "../graphql/mutations.js";
import {
  HelpBlock,
  FormGroup,
  FormControl,
  ControlLabel
} from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import "./Signup.css";
/*
This container is similar to Login.js but there are some differences. 
For Example before the Sign Up is finished they have to use the confirmationCode
We also have to switch to the confirmation input box

*/
export default class Signup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: false,
      email: "",
      password: "",
      confirmPassword: "",
      confirmationCode: "",
      newUser: null
    };
  }

  validateForm() {
    return (
      this.state.email.length > 0 &&
      this.state.password.length > 0 &&
      this.state.password === this.state.confirmPassword
    );
  }

  validateConfirmationForm() {
    return this.state.confirmationCode.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

/*
Signs user up to Cognito. But the user still needs to Confirm
using the confirmationCode.
*/
  handleSubmit = async event => {
  event.preventDefault();
  this.setState({ isLoading: true });
  try {
    const newUser = await Auth.signUp({
      username: this.state.email,
      password: this.state.password
    });
    this.setState({
      newUser
    });
  } catch (e) {
    alert(e.message);
  }

  this.setState({ isLoading: false });
}


/*
When User Confirms with the confirmationCode the user SignsUp
but also automatically Signs in. Then we create a UserPlaylists in GraphQL.
This aids with keeping track of which user created a playlist and which playlists
they have created. The process for login in is the same as Login
*/
handleConfirmationSubmit = async event => {
  event.preventDefault();
  this.setState({ isLoading: true });
  try {
    //Confirms the SignUp
    await Auth.confirmSignUp(this.state.email, this.state.confirmationCode);
    //Signs in
    await Auth.signIn(this.state.email, this.state.password);
    //Sets the global State
    const user = await Auth.currentAuthenticatedUser({bypassCache: false});
    this.props.setCognitoID(user.username);
    const createPlaylistsUser= await API.graphql(graphqlOperation(createUserPlaylists, {CognitoID:user.username}));
    this.props.setUserID(createPlaylistsUser.data.createUserPlaylists.id);
    this.props.userHasAuthenticated(true);
    //redirects to homepage
    this.props.history.push("/");
  } catch (e) {
    alert(e.message);
    this.setState({ isLoading: false });
  }
}

/*
These next functions renders different pages depending on the which stage of 
the signup they are in. For Example if they are in the intial stage or when
they are going to confirm the their signUp using the SignUp Code
*/
  renderConfirmationForm() {
    return (
      <form onSubmit={this.handleConfirmationSubmit}>
        <FormGroup controlId="confirmationCode" bsSize="large">
          <ControlLabel>Confirmation Code</ControlLabel>
          <FormControl
            autoFocus
            type="tel"
            value={this.state.confirmationCode}
            onChange={this.handleChange}
          />
          <HelpBlock>Please check your email for the code.</HelpBlock>
        </FormGroup>
        <LoaderButton
          block
          bsSize="large"
          disabled={!this.validateConfirmationForm()}
          type="submit"
          isLoading={this.state.isLoading}
          text="Verify"
          loadingText="Verifying…"
        />
      </form>
    );
  }

  renderForm() {
    return (
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
        <FormGroup controlId="confirmPassword" bsSize="large">
          <ControlLabel>Confirm Password</ControlLabel>
          <FormControl
            value={this.state.confirmPassword}
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
          text="Signup"
          loadingText="Signing up…"
        />
      </form>
    );
  }

  render() {
    return (
      <div className="Signup">
        {this.state.newUser === null
          ? this.renderForm()
          : this.renderConfirmationForm()}
      </div>
    );
  }
}
