import React, { Component } from "react";
import { Modal,Image, FormControl,Button,ListGroupItem, ListGroup} from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";
import "./NewPlaylist.css";
import { LinkContainer } from "react-router-bootstrap";
import {API, graphqlOperation} from "aws-amplify";
import {listUserPlaylists} from "../graphql/queries.js";
import {createPlaylist} from "../graphql/mutations.js";
import { Link} from "react-router-dom";
import "./Home.css";

/*
In this container component the playlists will be displayed and
a user will also be able to create a playlist in this container.
*/

export default class NewPlaylist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: null,
      show: false,
      currentName:"",
      playlists:[]
    };
  }
// I fetch the playlists
  async componentDidMount(){
    try {
      const playlists= await API.graphql(graphqlOperation(listUserPlaylists, {CognitoID:this.props.CognitoID}));
      this.setState({playlists: playlists.data.listUserPlaylistss.items[0].Playlists.items});
    }catch(e){
      console.log(e);
    }
  }

  handleChange = event => {
    this.setState({
      currentName: event.target.value
    });
  }

 showModal = () =>{
  this.setState({
    show: true
  });
 }
 hideModal = () =>{
    this.setState({
    show: false
  });
 }

// In this when someone submits a playlist name it 
// is put in the GraphQL database and the playlists state is updated

 SubmitPlaylist = async () =>{
  try{
  const newPlaylist = await API.graphql(graphqlOperation(createPlaylist, {
    userID: this.props.userID,
    name: this.state.currentName
  }));
  this.setState({
    playlists: [...this.state.playlists, newPlaylist.data.createPlaylist],
    show:false
  });
}catch(e){  
  console.log(e);
}
  // create a playlist and add it to the
 }

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true });
  }
//This page render different pages depending on if the user is logged in
  render() {
    return (
    <div className="NewPlaylist">
            {
            this.props.isAuthenticated ?
            <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            type="submit"
            isLoading={this.state.isLoading}
            text="Create Playlist"
            loadingText="Creating…"
            onClick={this.showModal}
          /> :
          <div className="Home">
            <div className="lander">
            <h1>You Are Not Logged In</h1>
            <p>To be able to create and use playlists you need to Sign Up</p>
              <div>
              <Link to="/login" className="btn btn-info btn-lg">
              Login
              </Link>
              <Link to="/signup" className="btn btn-success btn-lg">
              Signup
              </Link>
              </div>
            </div>
          </div>
          }

  <ListGroup>
  {
  this.state.playlists.map((playlist) =>{
  return (
  <LinkContainer key={playlist.id} to={"/playlist/"+playlist.id}> 
  <ListGroupItem key={playlist.id}> 
  <div>
  <article className="playlistBlock">
      <Image src="https://static.techspot.com/images2/news/bigimage/2019/08/2019-08-13-image-16.jpg" className="playlistThumb" responsive/>
      <div className="playlistDetails">
      <h4 >{playlist.name}</h4>
      </div>
    </article>
    </div>
    
  </ListGroupItem>
  </LinkContainer>
  )
  })

  }
  </ListGroup>  




  {/*
    This Modal is used for creating the playlists
    and has an input for the playlists Name


  */}   
  <div className="static-modal">
  <Modal show={this.state.show} onHide={this.hideModal}>
    <Modal.Header>
      <Modal.Title>Create Playlist</Modal.Title>
    </Modal.Header>
    <Modal.Body>    <FormControl
      placeholder="Playlist Name"
      aria-label="Playlist Name"
      onChange={this.handleChange}
    /></Modal.Body>
    <Modal.Footer>
      <Button onClick={this.hideModal}>Close</Button>
      <Button bsStyle="primary" onClick= {this.SubmitPlaylist}>Create Playlist</Button>
    </Modal.Footer>
  </Modal>
  </div>



  </div>






    );
  }
}
