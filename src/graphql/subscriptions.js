
export const onCreateSong = `subscription onCreateSong($playlistID: ID!) {
  onCreateSong (playlistID: $playlistID){
    id
    thumbnail
    time
    url
    name
    createdAt
    playlistID
  }
}
`;

export const onDeleteSong = `subscription OnDeleteSong($playlistID: ID!) {
  onDeleteSong (playlistID: $playlistID){
    id
  }
}
`;



