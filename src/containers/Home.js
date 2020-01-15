import React, { Component } from "react";
import "./Home.css";
import { Link} from "react-router-dom";
export default class Home extends Component {
/*
This container was used to display the Home Page but it was important 
to display different messages depending on the the person was authenticated for not.
Therefore I put the elements in a function and returned the page that should be
displayed depending on if the person is authenticated or not.


*/
  renderBasicLandingPage= () => {
  if(this.props.isAuthenticated){
    return (
    <div className="lander">
      <h1>Youtube Playlist</h1>
      <p>An App used for creating a youtube playlist where multiple users are able to access and add songs to the same playlist</p>
      <div>
        <Link to="/playlists" className="btn btn-success btn-lg">
          Click Here To Start Creating Playlists
        </Link>
      </div>
    </div>
  );
  }
  return (
    <div className="lander">
      <h1>Youtube Playlist</h1>
      <p>An App used for creating a youtube playlist where multiple users are able to access and add songs to the same playlist</p>
      <div>
        <Link to="/login" className="btn btn-info btn-lg">
          Login
        </Link>
        <Link to="/signup" className="btn btn-success btn-lg">
          Signup
        </Link>
      </div>
    </div>
  );
  }

  render() {
    return(
    <div className="Home">
    {this.renderBasicLandingPage()}
    </div>
    );
}
}
