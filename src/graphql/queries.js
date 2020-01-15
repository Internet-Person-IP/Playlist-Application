
export const listUserPlaylists = `query listUserPlaylists($CognitoID: String!){
    listUserPlaylistss(filter:{
    CognitoID: {contains: $CognitoID}
  }){
    items {
      id CognitoID Playlists{
        items{
          id name
        }
      }
    }
  }

}`;

export const getUserPlaylistsID = `query getUserPlaylistsID($CognitoID: String!){
    listUserPlaylistss(filter:{
    CognitoID: {contains: $CognitoID}
  }){
    items {
      id CognitoID
    }
  }

}`;

export const listSongsFromPlaylist = `query listSongsFromPlaylist($playlistID: ID!){

    getPlaylist(id: $playlistID){
      id
      name
      Songs{
        items{
              name thumbnail time url createdAt id
            }
          }
      userPlaylists{
        CognitoID
        id
      }
    }
}`;

export const getSong = `query GetSong($id: ID!) {
  getSong(id: $id) {
    id
    thumbnail
    time
    url
    name
    createdAt
    playlist {
      id
      name
      createdAt
    }
  }
}
`;

