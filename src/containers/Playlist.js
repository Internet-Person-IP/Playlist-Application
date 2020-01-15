import React, { Component } from "react";
import PlaylistItem from "./PlaylistItem"
import youtube from "../API/youtube"
import getYoutubeID from 'get-youtube-id'
import {Button, FormControl, InputGroup,ListGroup} from "react-bootstrap";
import ResponsiveReactPlayer from './ResponsiveReactPlayer'
import {API, graphqlOperation} from "aws-amplify";
import {listSongsFromPlaylist} from "../graphql/queries.js";
import {createSong, deleteSong} from "../graphql/mutations.js"
import {onCreateSong, onDeleteSong} from "../graphql/subscriptions.js"
import config from "../config";

/*
This container is probably the most important container component.
This component facilitates the playlists and handles a lot of the real time data
It creates a different experience depending on if the owner of the playlist access it.
If random user access it they are only able to add to the playlist
The Owner is the only user that is able to delete and also play songs from the playlists
*/
export default class Playlist extends Component {
  constructor(props) {
    super(props);

/*
The state probably needs some explanation
- playlist contains all the Song objects
- currentlyGoingtoAdd stores the song that is going to be added
- position tracks the position of the currentSong. This is only
  relevant to the owner since position is not sent as real data 
  to the other users
- playlistID is used for fetching the playlist. The playlist
  will be fetching or not the owner fetches it but only the owner has
  certain privleges.
- subscriptionOnCreate and subscriptionOnDelete are subcription objects 
  which will be used for unsubscribing when the component unmounts.
- isOwner is used to identify if it is the owner who is currently viewing 
  the playlist since the UI will be different if it is the owner viewing 
  the playlist they created. 

*/
    this.state = {
      isLoading: null,
      playlist:[],
      currentlyGoingToAdd:"",
      position: 1,
      currentlyPlaying:'',
      playlistID:props.match.params.id,
      subscriptionOnCreate:{},
      subscriptionOnDelete:{},
      isOwner:false
    };
  }

  handleChange = event => {
    this.setState({
      currentlyGoingToAdd: event.target.value
    });
  }

/*

In compounentDidMount alot of important aspect of the playlist component occur.
The playlist fetched from the API
Subscriptions are created meaning the real time data from playlists update are created
Also currentlyplaying is set.

*/
    async componentDidMount(){

      //gets the raw data from the playlist
      const playlistRaw=  API.graphql(graphqlOperation(
        listSongsFromPlaylist, {playlistID:this.state.playlistID}));


/*

sets up subscription such for when a song is added to the playlist
also for when a song is deleted from the playlist
these to change the playlist based on the action.
If the song is added then it will replace the playlist state with the new playlist
If a song is deleted than that item will be removed from the playlist state 

*/

      this.setState({
        subscriptionOnCreate: API.graphql(graphqlOperation(onCreateSong,{playlistID: this.state.playlistID}))
      .subscribe({next: (eventData) =>{
        if(this.state.playlist.length===0){
          this.setState({
            currentlyPlaying: eventData.value.data.onCreateSong.url,
            playlist: [...this.state.playlist, eventData.value.data.onCreateSong]
          });
        }else{
        this.setState({playlist: [...this.state.playlist, eventData.value.data.onCreateSong]})  
        }
      },
      error: (error) =>{ console.log(error);}
    }),
      subscriptionOnDelete: API.graphql(graphqlOperation(onDeleteSong,{playlistID: this.state.playlistID}))
      .subscribe({next: (eventData) =>{
        this.setState({playlist: this.state.playlist.filter(playlistItem => playlistItem.id !== eventData.value.data.onDeleteSong.id)
      })
      
      },
      error: (error) =>{ console.log(error);}
    })

});

//get the playlist Data and select a song to play
//also check if the user is the owner or not
      const playlistData= await playlistRaw;
      const currentlyPlaying= playlistData.data.getPlaylist.Songs.items.length===0 ? "" : playlistData.data.getPlaylist.Songs.items[0].url;
      const isTheOwner = playlistData.data.getPlaylist.userPlaylists.CognitoID===this.props.CognitoID;
      this.setState({
        playlist: playlistData.data.getPlaylist.Songs.items,
        currentlyPlaying: currentlyPlaying,
        isOwner: isTheOwner

      });
  }

/*
ChangeSong is used by the owner if he wants to changeSong by clicking a specific
PlaylistItem. It is also used for when a song is deletedFrom the playlist to decided
which song to play

*/
  ChangeSong = (url, position) => {
    console.log(this.state.currentlyPlaying);

    this.setState({
      currentlyPlaying: url,
      position: position
    });
 
  }
/*
unsubscribes so that random sockets are not open when the application is done with its use.

*/
  componentWillUnmount() {
        this.state.subscriptionOnCreate.unsubscribe();
        this.state.subscriptionOnDelete.unsubscribe();
  }

/*

deleteFromPlaylist is simple. It deletes a song from the playlist and GraphQL database.
but when a song is deleted and it is the song that is currently playing different action occurs
If the currentlyplaying song is in the end then previous song start playing
if the the only item then it deletes the only item
in other cases it deletes a song and plays the next song 
*/


  deleteFromPlaylist = async (id,url,position) =>{
    try{
    await API.graphql(graphqlOperation(deleteSong,{songID:id}));
    if(this.state.currentlyPlaying===url){
      if(this.state.playlist.length===1){
      this.setState({
        currentlyPlaying: '',
        playlist:[],
        position:1

    });
      }else if(position===this.state.playlist.length){
      this.ChangeSong(this.state.playlist[position-2].url, position-1);
      }else{
      this.ChangeSong(this.state.playlist[position].url, position+1);
      }
    }
    
  }catch(e){console.log(e)}
  }


/*
AddToPlaylist takes a link and and gets data from the the youtube API.
Then creates a Song object and uses it as an input for graphQL API to add
a song to the playlist. Also if there is no songs in the playlist it plays the song.
*/
  AddToPlaylist = async (event) => {

    const link =this.state.currentlyGoingToAdd;
    if(!link.includes("youtube")){
      alert("Not A youtube Link");
      return;
    }

  //The youtube API was used for getting specific details about the Song
    const youtubeResponse= await youtube.get('videos',{
      params:{
        part:"snippet,contentDetails",
        key: config.Youtube.API_KEY,
        id:getYoutubeID(link)
      }
    });

    const Song={
    playlistID: this.state.playlistID,
    thumbnail: youtubeResponse.data.items[0].snippet.thumbnails.default.url,
    time: youtubeResponse.data.items[0].contentDetails.duration,
    url: link,
    name: youtubeResponse.data.items[0].snippet.title
    }

    /*if(this.state.playlist===[]){
    this.setState({currentlyPlaying: Song.url});
    }*/
    this.setState({currentlyGoingToAdd:''});
    await API.graphql(graphqlOperation(createSong,Song)); 

  }

/*
OnEnd is called when a song has ended. The song is then changed to the next
Song in the playlist
*/

  onEnd = ()=> {
    if(this.state.position<this.state.playlist.length){
    this.setState({
      position: this.state.position+1,
      currentlyPlaying: this.state.playlist[this.state.position].url
      })
    }
  }

/*This funtion deals with rendering the playlistItems aka the songs in the playlist*/
 renderPlaylistItem = (position, ListItem) =>  {
  return (<PlaylistItem isOwner={this.state.isOwner} id={ListItem.id} key={position+1} onClickItem={this.ChangeSong} title={ListItem.name} duration={ListItem.time}
            thumbnail={ListItem.thumbnail} position={position+1} url={ListItem.url} deleteFromPlaylist={this.deleteFromPlaylist}/>);
  }

  render() {
    return (
      <div className="Playlist">
        { this.state.isOwner && this.state.playlist.length>0 && <ResponsiveReactPlayer url={this.state.currentlyPlaying} onEnd={this.onEnd}/>}
        <InputGroup>
          <FormControl
          placeholder="Youtube URL"
          aria-label="Youtube URL"
          onChange={this.handleChange}
          value={this.state.currentlyGoingToAdd}
          />
          <InputGroup.Button>
          <Button onClick={this.AddToPlaylist} >Add to Playlist</Button>
          </InputGroup.Button>
        </InputGroup>
        <ListGroup>
          {/*We traverse the playlist to get eact individual Song*/
            this.state.playlist.map((ListItem, position) => {
              return this.renderPlaylistItem(position,ListItem)
            })
          }
        </ListGroup>
      </div>
    );
  }
}
