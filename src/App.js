import React, { Component, Fragment } from "react";
import { Link, withRouter} from "react-router-dom";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import Routes from "./Routes";
import { LinkContainer } from "react-router-bootstrap";
import { Auth ,API , graphqlOperation} from "aws-amplify";
import {listUserPlaylists} from "./graphql/queries.js";
import "./App.css";

/*
This Component has contains the most important parts of the application.
It tracks the isAuthenticated, CognitoID and userID. These are key properties 
for the application since they are used alot of the logic and the communcation 
with the GraphQL API.

*/

class App extends Component {
constructor(props) {
  super(props);

  this.state = {
    isAuthenticated: false,
    isAuthenticating: true,
    CognitoID: "",
    userID:""
  };
}

/*
We use use currentAuthenticatedUser to enable a session. So that if a person
refreshes the website, all state can the reaquired. But if the try statement fails,
then we can most likely say that there is session created in Cognito. 
*/

async componentDidMount() {
  try {
    const CurrentUser= await Auth.currentAuthenticatedUser({bypassCache: false});
    const UserPlaylist= await API.graphql(graphqlOperation(listUserPlaylists, {CognitoID: CurrentUser.username }));
    this.setState({
      CognitoID: CurrentUser.username,
      userID: UserPlaylist.data.listUserPlaylistss.items[0].id,
      isAuthenticated:true,
      isAuthenticating: false
    });
  }
  catch(e) {
    if (e !== 'No current user') {
      console.log(e);
    }
  }

  this.setState({ isAuthenticating: false });
}


/*
Here are a couple of function that help us with setting up the state 
when a new user has been created or when a person decides to Loggin.
*/

userHasAuthenticated = authenticated => {
  this.setState({ isAuthenticated: authenticated });
}

setUserID = async (id) =>{

 this.setState({userID: id });
} 

setCognitoID = async id => {
  this.setState({CognitoID: id});
}
handleLogout = (event) => {

  Auth.signOut().then(data => {
    console.log(data);
  this.setState({
    isAuthenticated: false,
    isAuthenticating: true,
    CognitoID: "",
    userID:""
  });
  }).catch(error =>{
    console.log(error);
  })
}

render() {
/*
These props are created since they are used by the container components
for example Sign In or Sign Up. They are also used when doing API calls to 
the GraphQL API.
*/
  const childProps = {
    isAuthenticated: this.state.isAuthenticated,
    userHasAuthenticated: this.userHasAuthenticated,
    CognitoID:this.state.CognitoID,
    setCognitoID: this.setCognitoID,
    userID: this.state.userID,
    setUserID: this.setUserID
  };

/*
Depending on if the a user has signed in and Authenticated we want them 
to have see different elements. We use React Route to Route to the
different directories of the website.
*/
  return (
    !this.state.isAuthenticating &&
    <div className="App container">
      <Navbar fluid collapseOnSelect>
        <Navbar.Header>
          <Navbar.Brand>
            <Link to="/">Youtube Playlist</Link>
          </Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Nav>
        <LinkContainer exact to="/">
        <NavItem >
        Home
        </NavItem>
        </LinkContainer>
        <LinkContainer to="/playlists">
        <NavItem >
          Playlists
        </NavItem>
        </LinkContainer>
        </Nav>
        <Navbar.Collapse>
          <Nav pullRight>
            {this.state.isAuthenticated
              ?
              <NavItem href="/login" onClick={this.handleLogout}>Logout</NavItem>
              : <Fragment>
                  <LinkContainer to="/signup">
                    <NavItem>Signup</NavItem>
                  </LinkContainer>
                  <LinkContainer to="/login">
                    <NavItem>Login</NavItem>
                  </LinkContainer>
                </Fragment>
            }
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Routes childProps={childProps} />
    </div>
  );
}




}
export default withRouter(App);

