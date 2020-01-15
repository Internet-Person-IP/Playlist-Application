
export const createUserPlaylists = 
`mutation CreateUserPlaylists($CognitoID: String!){
    createUserPlaylists(input: {CognitoID: $CognitoID}){
      id CognitoID
    }
}`;

export const createPlaylist = `
mutation createPlaylist($userID: ID! $name: String!){
  createPlaylist(input: {
    playlistUserPlaylistsId: $userID
    name: $name
  }){
    id name
  }
}

`;
export const createSong = `mutation createSong($playlistID: ID! $name: String! $thumbnail: String! $time: String! $url: String!){
  createSong(input:{
    thumbnail:$thumbnail
    time:$time
    url:$url
    name:$name
    playlistID:$playlistID
    songPlaylistId: $playlistID
  }) {
    id url name time thumbnail playlistID playlist{
      id
    }
  }
  
}`;

export const deleteSong = `mutation DeleteSong($songID: ID!) {
  deleteSong(input: {id: $songID}) {
    id playlistID
  }
}
`;




