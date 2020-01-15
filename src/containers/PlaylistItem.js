import React from "react";
import "./PlaylistItem.css"
import {Button, Image,ListGroupItem} from "react-bootstrap";
/*
Return a listGroupItem. 
Gets props to aid with certain action such as changing song.
or when someone deletes a song
*/
 const PlaylistItem = ({deleteFromPlaylist,isOwner, onClickItem,position, thumbnail, title, duration,url,id}) => {

	return (
		<ListGroupItem>
		<article className ="PlaylistItem" onClick={()=>{ if(isOwner){onClickItem(url,position)}}}>
			<p className="Number">{position}</p>	
			<Image src={thumbnail} className="thumb" responsive/>
			<div className="details">	
			<h4 className="Title">{title}</h4>
			<p className="Duration">{duration}</p>
			<div className= "deleteButton">
			{isOwner && <Button bsStyle="danger" onClick={(event)=>{ event.stopPropagation(); deleteFromPlaylist(id,url,position)}}> Delete</Button>}
			</div>
			</div>
		</article>
		</ListGroupItem>
		);
	}


export default PlaylistItem;