var Support = {
		previousPageDetails : [],
		
		selectedItem : 0,
		topLeftItem : 0,
		isTopRow : true,
		
		//Scrolling Text's 
		startScroll : null,
		scroller : null,
		scrollpos : 0,
		resetToTop : null,
		
		//Screensaver
		screensaverVar : null,
		screensaverTime : 10000
}

Support.logout = function() {
	//Turn off screensaver
	Support.screensaverOff();
	
	document.getElementById("headerUser").style.visibility = "hidden";
	document.getElementById("headerUserImage").style.backgroundImage = "";
	document.getElementById("headerTypes").innerHTML = "";
	Server.setUserID("");
	Server.setUserName("");
	File.setUserEntry(null);
	Server.Logout();
	GuiUsers.start(false);
}

Support.updateHomePageURLs = function (title,url,title2Name,isURL1) {
	this.previousPageDetails[0][0] = "GuiPage_HomeTwoItems";

	if (isURL1 == true) {
		this.previousPageDetails[0][1] = title;
		this.previousPageDetails[0][2] = url;
	} else {
		this.previousPageDetails[0][3] = title;
		this.previousPageDetails[0][4] = url;
	}
	
	if (title2Name == "None") {
		this.previousPageDetails[0][0] = "GuiPage_HomeOneItem";
	}
}

Support.updateURLHistory = function(page,title,url,title2,url2,selectedItem,topLeftItem,isTop) {
	//Check to stop episodes to episode scrolling from adding to the return array
	if (page == "GuiPage_ItemDetails" && this.previousPageDetails[this.previousPageDetails.length-1][0] == "GuiPage_ItemDetails") {
		//Pop the last one and add the current page
		//Thus if you play a video and return it returns to the latest Episode Page, not the one you entered on
		this.previousPageDetails.pop();
	}
	
	//Only add new page if going to new page (if url's are the same don't add) - Length must be greater than 0
	if (this.previousPageDetails.length > 0) {
		//If greater than 0 check if page isnt the same as previous page
		
		if (this.previousPageDetails[this.previousPageDetails.length-1][2] != url) {
			this.previousPageDetails.push([page,title,url,title2,url2,selectedItem,topLeftItem,isTop]);
			alert ("Adding new item: " + this.previousPageDetails.length);
		} else {
			alert ("New Item not added - Is duplicate of previous page: " + this.previousPageDetails.length);
		}
	} else {
		this.previousPageDetails.push([page,title,url,title2,url2,selectedItem,topLeftItem,isTop]);
		alert ("Adding new item: " + this.previousPageDetails.length);
	}
}

//Below method used for Main Menu
Support.removeLatestURL = function() {
	this.previousPageDetails.pop();
	alert ("Removed item: " + this.previousPageDetails.length);
}

Support.removeAllURLs = function() {
	this.previousPageDetails.length = 0;
}
	
Support.processReturnURLHistory = function() {
	alert ("Just before removing item" + this.previousPageDetails.length);
	
	//Reset Help 
	document.getElementById("Help").innerHTML = "";
	document.getElementById("Help").style.visibility = "hidden";

	if (this.previousPageDetails.length > 0) {
		var array = this.previousPageDetails[this.previousPageDetails.length-1];
		var page = array[0];
		var title = array[1];
		var url = array[2];
		var title2 = array[3];
		var url2 = array[4];
		var selectedItem = array[5];
		var topLeftItem = array[6];
		var isTop = array[7];
		
		//Handle Navigation?
		switch (page) {
			case "GuiPage_HomeOneItem":
				GuiPage_HomeOneItem.start(title,url,selectedItem,topLeftItem);
				break;
			case "GuiPage_HomeTwoItems": 	
				GuiPage_HomeTwoItems.start(title,url,title2,url2,selectedItem,topLeftItem,isTop);
				break;	
			case "GuiDisplay_Series":
				GuiDisplay_Series.start(title,url,selectedItem,topLeftItem);
				break;
			case "GuiDisplay_Episodes":
				GuiDisplay_Episodes.start(title,url,selectedItem,topLeftItem);
				break;
			case "GuiDisplayOneItem":
				GuiDisplayOneItem.start(title,url,selectedItem,topLeftItem);
				break;
			case "GuiTV_Show":
				GuiTV_Show.start(title,url,selectedItem,topLeftItem);
				break;	
			case "GuiPage_ItemDetails":
				GuiPage_ItemDetails.start(title,url,selectedItem);
				break;	
			case "GuiDisplayTwoItems": 	
				GuiDisplayTwoItems.start(title,url,title2,url2,selectedItem,topLeftItem,isTop);
				break;	
			case "GuiPage_MusicArtist": 	
				GuiPage_MusicArtist.start(title,url);
				break;
			case "GuiPage_Music": 	
				GuiPage_Music.start(title,url);
				break;	
			case "GuiPage_CastMember": 	
				GuiPage_CastMember.start(title,url,selectedItem,topLeftItem);
				break;	
			case "GuiPage_PhotoNavigation":
				GuiPage_PhotoNavigation.start(title,url,selectedItem,topLeftItem);
				break;	
			default:
				break;
		}
		
		this.previousPageDetails.pop();
		
		alert ("Just after removing item" + this.previousPageDetails.length);
	} else {
		widgetAPI.sendReturnEvent();
	}
}

Support.destroyURLHistory = function() {
	this.previousPageDetails.length = 0;
}


Support.processIndexing = function(ItemsArray) {	
	var alphabet = "abcdefghijklmnopqrstuvwxyz";
	var currentLetter = 0;
	var indexLetter = [];
	var indexPosition = [];
	
	//Push non alphabetical chars onto index array
	var checkForNonLetter = ItemsArray[0].SortName.charAt(0).toLowerCase();	
	if (checkForNonLetter != 'a') {
		indexPosition.push(0);
		indexLetter.push('#');
	}
	
	for (var index = 0; index < ItemsArray.length; index++) {	
		var letter = ItemsArray[index].SortName.charAt(0).toLowerCase();	
		if (letter == alphabet.charAt(currentLetter-1)) {
			//If item is second or subsequent item with the same letter do nothing
		} else {
			//If Next Letter
			if (letter == alphabet.charAt(currentLetter)) {
				indexPosition.push(index);
				indexLetter.push(alphabet.charAt(currentLetter));
				currentLetter++;
			//Need to check as items may skip a letter (Bones , Downton Abbey) Above code would stick on C	
			} else {
				for (var alpha = currentLetter + 1; alpha < 26; alpha++) {										
					if (letter == alphabet.charAt(alpha)) {
						indexPosition.push(index);
						indexLetter.push(alphabet.charAt(alpha));
						currentLetter= currentLetter + ((alpha - currentLetter)+1);
						break;
					}	
				}
			}	
		}		
	}
	var returnArrays = [indexLetter, indexPosition];
	return  returnArrays;	
}

//-----------------------------------------------------------------------------------------------------------------------------------------

Support.updateDisplayedItems = function(Array,selectedItemID,startPos,endPos,DivIdUpdate,DivIdPrepend, isResume,Genre,showBackdrop) {
	var htmlToAdd = "";
	for (var index = startPos; index < endPos; index++) {
		if (isResume == true) {
			if (Array[index].Type == "Episode") {
				var title = this.getNameFormat(Array[index].SeriesName, Array[index].ParentIndexNumber, Array[index].Name, Array[index].IndexNumber);			
				
				if (Array[index].SeriesThumbImageTag) {
					title = this.getNameFormat("", Array[index].ParentIndexNumber, Array[index].Name, Array[index].IndexNumber);
					var imgsrc = Server.getImageURL(Array[index].SeriesId,"Thumb",220,125,0,false,Array[index].UserData.PlayedPercentage);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItemWithProgress>" + title +"</div></div>";	
				} else if (Array[index].ImageTags.Primary) {	
					var imgsrc = Server.getImageURL(Array[index].Id,"Primary",220,125,0,false,Array[index].UserData.PlayedPercentage);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItemWithProgress>"+ title + "</div></div>";
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(images/collection.png)><div class=menuItemWithProgress>"+ title + "</div></div>";
				}
			} else {
				var title = Array[index].Name;
				if (Array[index].ImageTags.Thumb) {		
					var imgsrc = Server.getImageURL(Array[index].Id,"Thumb",220,125,Array[index].UserData.PlayCount,Array[index].UserData.Played,Array[index].UserData.PlayedPercentage);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItemWithProgress></div></div>";	
				} else if (Array[index].BackdropImageTags.length > 0) {	
					var imgsrc = Server.getBackgroundImageURL(Array[index].Id,"Backdrop",220,125,Array[index].UserData.PlayCount,Array[index].UserData.Played,Array[index].UserData.PlayedPercentage,Array[index].BackdropImageTags.length);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItemWithProgress>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(images/collection.png)><div class=menuItem>"+ title + "</div></div>";
				}
			}			
		} else {	
			if (Array[index].Type == "Genre") {	
				var itemCount = 0;
				
				switch (Genre) {
				case "Movie":
					itemCount = Array[index].MovieCount;
					break;
				case "Series":
					itemCount = Array[index].SeriesCount;
					break;
				default:
					break;
				}
				
				if (Array[index].ImageTags.Primary) {			
					var imgsrc = Server.getImageURL(Array[index].Id,"Primary",96,160,0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=genreItemCount>"+itemCount+"</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-color:rgba(0,0,0,0.5);><div class=genreItemCount>"+itemCount+"</div></div>";
				}
			} else if (Array[index].Type == "Episode") {
				var title = this.getNameFormat(Array[index].SeriesName, Array[index].ParentIndexNumber, Array[index].Name, Array[index].IndexNumber);	
				
				var imageData = "";	
				if (Array[index].SeriesThumbImageTag) {	
					var imgsrc = Server.getImageURL(Array[index].SeriesId,"Thumb",220,125,0,Array[index].UserData.Played,0);
					imageData = "background-image:url(" +imgsrc+ ")";
					title = this.getNameFormat("", Array[index].ParentIndexNumber, Array[index].Name, Array[index].IndexNumber);
				} else 	if (Array[index].ImageTags.Primary) {	
					var imgsrc = Server.getImageURL(Array[index].Id,"Primary",220,125,0,Array[index].UserData.Played,0);	
					imageData = "background-image:url(" +imgsrc+ ")";
				} else {
					imageData = "background-color:rgba(0,0,0,0.5)";
				}
				
				//Change to use DrWatsons tick image!
				if (Array[index].UserData.Played > 0) {
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style="+imageData+"><div class=genreItemCount>&#10003</div><div class=menuItem>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style="+imageData+"><div class=menuItem>"+ title + "</div></div>";	
				}
				
			} else if (Array[index].Type == "MusicAlbum"){
				var title = Array[index].Name;		
				if (Array[index].ImageTags.Primary) {		
					var imgsrc = Server.getImageURL(Array[index].Id,"Primary",109,109,Array[index].UserData.PlayCount,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=genreItemCount>"+Array[index].RecursiveItemCount+"</div><div class=menuItem>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(images/album.png)><div class=genreItemCount>"+Array[index].RecursiveItemCount+"</div><div class=menuItem>"+ title + "</div></div>";
				} 
			}  else if (Array[index].Type == "MusicArtist"){
				var title = Array[index].Name;		
				var count = Array[index].SongCount;
				
				if (Array[index].ImageTags.Primary) {			
					var imgsrc = Server.getImageURL(Array[index].Id,"Primary",109,109,0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=genreItemCount>"+count+"</div><div class=menuItem>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(images/artist.png)><div class=genreItemCount>"+count+"</div><div class=menuItem>"+ title + "</div></div>";
				} 
			} else if (Array[index].Type == "Audio"){
				var title = Array[index].Name;		
				if (Array[index].AlbumPrimaryImageTag) {	
					var imgsrc = Server.getImageURL(Array[index].AlbumId,"Primary",109,109,0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItem>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(images/album.png)><div class=menuItem>"+ title + "</div></div>";
				}
			} else if (Array[index].Type == "Series" || Array[index].Type == "Movie") {
				var title = Array[index].Name;	
				if (showBackdrop == "yes") {
					if (Array[index].BackdropImageTags.length > 0) {
						var imgsrc = Server.getBackgroundImageURL(Array[index].Id,"Backdrop",220,125,0,false,0,Array[index].BackdropImageTags.length);
						htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItem>"+ title + "</div></div>";
					} else {
						htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style='background-color:rgba(0,0,0,0.5);'><div class=menuItem>"+ title + "</div></div>";				
					}
				} else {
					if (Array[index].ImageTags.Primary) {
						var imgsrc = Server.getImageURL(Array[index].Id,"Primary",96,160,0,false,0);
						htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")></div>";
					} else {
						htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style='background-color:rgba(0,0,0,0.5);'><div class=menuItem>"+ title + "</div></div>";				
					}
				}	
			} else if (Array[index].Type == "TvChannel") {
				var title = Array[index].Name;		
				if (Array[index].ImageTags.Primary) {			
					var imgsrc = Server.getImageURL(Array[index].Id,"Primary",220,125,0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItem>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-color:rgba(0,0,0,0.5);><div class=menuItem>"+ title + "</div></div>";
				} 
			} else if (Array[index].Type == "CollectionFolder") {
				var title = Array[index].Name;	
				
				if (Array[index].BackdropImageTags.length > 0) {			
					var imgsrc = Server.getBackgroundImageURL(Array[index].Id,"Backdrop",220,125,0,false,0,Array[index].BackdropImageTags.length);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItem>"+ title + "</div></div>";		
				//} else if (Array[index].ImageTags.Primary) {			
				//	var imgsrc = Server.getImageURL(Array[index].Id,"Primary",110,80);
				//	htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItem>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-color:rgba(0,0,0,0.5);><div class=menuItem>"+ title + "</div></div>";
				} 	
			} else if (Array[index].Type == "Season") {
				if (Array[index].BackdropImageTags.length > 0) {			
					var imgsrc = Server.getBackgroundImageURL(Array[index].Id,"Primary",114,165,Array[index].UserData.PlayCount,Array[index].UserData.Played,Array[index].UserData.PlayedPercentage,Array[index].BackdropImageTags.length);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-color:rgba(0,0,0,0.5);></div>";
				}
			} 
			else if (Array[index].Type == "Channel") {
				var title = Array[index].Name;	 
				if (Array[index].BackdropImageTags.length > 0) {			
					var imgsrc = Server.getBackgroundImageURL(Array[index].Id,"Backdrop",220,125,0,false,0,Array[index].BackdropImageTags.length);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItem>"+ title + "</div></div>";	
				}
				else if (Array[index].ImageTags.Thumb) {		
					var imgsrc = Server.getImageURL(Array[index].Id,"Thumb",220,125,0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItem>"+ title + "</div></div>";
				}
				else {
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-color:rgba(0,0,0,0.5);><div class=menuItem>"+ title + "</div></div>";
				}
			}
			else if (Array[index].Type == "ChannelFolderItem") {
				var title = Array[index].Name;		
				if (Array[index].ImageTags.Primary) {			
					var imgsrc = Server.getImageURL(Array[index].Id,"Primary",220,125,0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItem>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-color:rgba(0,0,0,0.5);><div class=menuItem>"+ title + "</div></div>";
				}
			}
			else if (Array[index].Type == "ChannelVideoItem") {
				var title = Array[index].Name;		
				if (Array[index].ImageTags.Primary) {			
					var imgsrc = Server.getImageURL(Array[index].Id,"Primary",220,125,0,false,0);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItem>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-color:rgba(0,0,0,0.5);><div class=menuItem>"+ title + "</div></div>";
				}
			}
			else {
				var title = Array[index].Name;		
				if (Array[index].BackdropImageTags.length > 0) {			
					var imgsrc = Server.getBackgroundImageURL(Array[index].Id,"Backdrop",220,125,0,false,0,Array[index].BackdropImageTags.length);
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-image:url(" +imgsrc+ ")><div class=menuItem>"+ title + "</div></div>";	
				} else {
					htmlToAdd += "<div id="+ DivIdPrepend + Array[index].Id + " style=background-color:rgba(0,0,0,0.5);><div class=menuItem>"+ title + "</div></div>";
				}			
			}	 	
		}
    }
	
	document.getElementById(DivIdUpdate).innerHTML = htmlToAdd;
}

//-----------------------------------------------------------------------------------------------------------------------------------------

Support.getNameFormat = function(SeriesName, SeriesNo, EpisodeName, EpisodeNo) {
	 if (File.getUserProperty("SeasonLabel")){
		 if (SeriesName == "" || SeriesName == null) {
				if (SeriesNo !== undefined && EpisodeNo !== undefined) {
					
					var seasonNumber = SeriesNo;
					var seasonString = "";
					if (seasonNumber < 10){
						seasonString = "0" + seasonNumber;
					}
					else{
						seasonString = seasonNumber;
					}
					
					var episodeNumber = EpisodeNo;
					var episodeString = "";
					if (episodeNumber < 10){
						episodeString = "0" + episodeNumber;
					}
					else{
						episodeString = episodeNumber;
					}

					return "S" + seasonString + "E" + episodeString + " - " + EpisodeName;		
				} else {
					return EpisodeName;
				}
			} else {
				if (SeriesNo !== undefined && EpisodeNo !== undefined) {
					var seasonNumber = SeriesNo;
					var seasonString = "";
					if (seasonNumber < 10){
						seasonString = "0" + seasonNumber;
					}
					else{
						seasonString = seasonNumber;
					}
					
					var episodeNumber = EpisodeNo;
					var episodeString = "";
					if (episodeNumber < 10){
						episodeString = "0" + episodeNumber;
					}
					else{
						episodeString = episodeNumber;
					}

					return SeriesName + "<br>S" + seasonString + "E" + episodeString + " - " + EpisodeName;		
				} else {
					return SeriesName + "<br>"+EpisodeName;
				}
			}
	 }else{
		 if (SeriesName == "" || SeriesName == null) {
				if (SeriesNo !== undefined && EpisodeNo !== undefined) {
					return "S" + SeriesNo + ",E" + EpisodeNo + " - " + EpisodeName;		
				} else {
					return EpisodeName;
				}
			} else {
				if (SeriesNo !== undefined && EpisodeNo !== undefined) {
					return SeriesName + "<br>S" + SeriesNo + ",E" + EpisodeNo + " - " + EpisodeName;		
				} else {
					return SeriesName + "<br>"+EpisodeName;
				}
			}
	 }
	
	
}

//-----------------------------------------------------------------------------------------------------------------------------------------

//ByPass Counter required for views that have 2 lists (Like Home Page) so I only display the counter of the active list
Support.updateSelectedNEW = function(Array,selectedItemID,startPos,endPos,strIfSelected,strIfNot,DivIdPrepend,dontUpdateCounter) {
	for (var index = startPos; index < endPos; index++){	
		if (index == selectedItemID) {
			document.getElementById(DivIdPrepend + Array[index].Id).className = strIfSelected;			
		} else {	
			document.getElementById(DivIdPrepend +  Array[index].Id).className = strIfNot;		
		}			
    }
	
	//Update Counter DIV
	if (dontUpdateCounter == true) { //Done like this so it will process null		
	} else {
		if (Array.length == 0) {
			document.getElementById("Counter").innerHTML = "";
		} else {
			document.getElementById("Counter").innerHTML = (selectedItemID + 1) + "/" + Array.length;
		}	
	}	
}

//-----------------------------------------------------------------------------------------------------------------------------------------

Support.processSelectedItem = function(page,ItemData,startParams,selectedItem,topLeftItem,isTop,genreType,isLatest) {
	if (page == "GuiPage_HomeTwoItems") {
		Support.updateURLHistory(page,startParams[0],startParams[1],startParams[2],startParams[3],selectedItem,topLeftItem,isTop);
	} else {
		Support.updateURLHistory(page,startParams[0],startParams[1],null,null,selectedItem,topLeftItem,null);
	}
	
	if (ItemData.Items[selectedItem].CollectionType != null) {
		switch (ItemData.Items[selectedItem].CollectionType) {
		case "tvshows" :	
			var url = Server.getChildItemsURL(ItemData.Items[selectedItem].Id,"&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Series&Recursive=true&CollapseBoxSetItems=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
			GuiDisplay_Series.start(ItemData.Items[selectedItem].Name,url,0,0);
			break;
		case "movies" :
			var url = Server.getChildItemsURL(ItemData.Items[selectedItem].Id,"&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Movie&Recursive=true&CollapseBoxSetItems=false&fields=ParentId,SortName,Overview,Genres,RunTimeTicks");
			GuiDisplay_Series.start(ItemData.Items[selectedItem].Name,url,0,0);
			break;	
		case "music" :
			if (Main.isMusicEnabled()) {			
				var url = Server.getChildItemsURL(ItemData.Items[selectedItem].Id,"&IncludeItemTypes=MusicAlbum&Recursive=true&ExcludeLocationTypes=Virtual&fields=ParentId,SortName&CollapseBoxSetItems=false");
				GuiDisplay_Series.start("Album",url,0,0);
			} else {
				Support.removeLatestURL();
			}
			break;
		case "photos" :
			//Handle as a folder
			if (Main.isPhotoEnabled()){
				var url = Server.getChildItemsURL(ItemData.Items[selectedItem].Id,"&SortBy=SortName&SortOrder=Ascending&fields=SortName");
				GuiDisplayOneItem.start(ItemData.Items[selectedItem].Name,url,0,0);
			} else {
				Support.removeLatestURL();
			}
			break;	
		default:
			var url = Server.getChildItemsURL(ItemData.Items[selectedItem].Id,"&SortBy=SortName&SortOrder=Ascending&fields=SortName");
			GuiDisplayOneItem.start(ItemData.Items[selectedItem].Name,url,0,0);
			break;
		}
	} else {
		switch (ItemData.Items[selectedItem].Type) {
		case "CollectionFolder":
		case "BoxSet":	
			//URL Below IS TEMPORARY TO GRAB SERIES OR FILMS ONLY - IN FUTURE SHOULD DISPLAY ALL
			var url = Server.getChildItemsURL(ItemData.Items[selectedItem].Id,"&SortBy=SortName&SortOrder=Ascending&Recursive=true&CollapseBoxSetItems=false&fields=SortName");
			GuiDisplayOneItem.start(ItemData.Items[selectedItem].Name,url,0,0);
			break;
		case "ManualCollectionsFolder":
			if (Main.isCollectionsEnabled() == true) {
				var url = Server.getChildItemsURL(ItemData.Items[selectedItem].Id,"&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=BoxSet&Recursive=true&CollapseBoxSetItems=false&fields=SortName");
				GuiDisplayOneItem.start("Collections", url,0,0);
			} else {
				Support.removeLatestURL();
			}	
			break;
		case "Series":
			//Is Latest Items Screen - If so skip to Episode view of latest episodes
			if (isLatest) {
				var url = Server.getCustomURL("/Users/" + Server.getUserID() + "/Items/Latest?format=json&Limit="+ItemData.Items[selectedItem].ChildCount+"&ParentId="+ItemData.Items[selectedItem].Id+"&isPlayed=false&IsFolder=false&GroupItems=false&fields=SortName,Overview,Genres,RunTimeTicks");
				GuiDisplay_Episodes.start("New TV",url,0,0);
			} else {
				var url = Server.getItemInfoURL(ItemData.Items[selectedItem].Id,null);
				GuiTV_Show.start(ItemData.Items[selectedItem].Name,url,0,0);
			}	
			break;		
		case "Movie":
			var url = Server.getItemInfoURL(ItemData.Items[selectedItem].Id,null);
			GuiPage_ItemDetails.start(ItemData.Items[selectedItem].Name,url,0);
			break;	
		case "Episode":
			var url = Server.getItemInfoURL(ItemData.Items[selectedItem].Id,null);
			GuiPage_ItemDetails.start(ItemData.Items[selectedItem].Name,url,0);
			break;
		case "Genre":
			var url = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes="+genreType+"&Recursive=true&CollapseBoxSetItems=false&fields=ParentId,SortName,Overview,RunTimeTicks&Genres=" + ItemData.Items[selectedItem].Name);
			GuiDisplay_Series.start(ItemData.Items[selectedItem].Name, url,0,0);		
			break;
		case "MusicArtist":	
			var artist = ItemData.Items[selectedItem].Name.replace(/ /g, '+');	 
			artist = artist.replace(/&/g, '%26');	
			var url = Server.getItemTypeURL("&SortBy=Album%2CSortName&SortOrder=Ascending&IncludeItemTypes=Audio&Recursive=true&CollapseBoxSetItems=false&Artists=" + artist);
			GuiPage_Music.start(ItemData.Items[selectedItem].Name,url,ItemData.Items[selectedItem].Type);
			break;	
		case "MusicAlbum":	
			var url = Server.getChildItemsURL(ItemData.Items[selectedItem].Id,"&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=Audio&Recursive=true&CollapseBoxSetItems=false");
			GuiPage_Music.start(ItemData.Items[selectedItem].Name,url,ItemData.Items[selectedItem].Type);
			break;	
		case "Folder":
			var url = Server.getChildItemsURL(ItemData.Items[selectedItem].Id,"&SortBy=SortName&SortOrder=Ascending&fields=SortName,ParentId");
			GuiDisplayOneItem.start(ItemData.Items[selectedItem].Name,url,0,0);
			break;	
		case "Channel":
			var url = Server.getCustomURL("/Channels/"+ItemData.Items[selectedItem].Id+"/Items?userId="+Server.getUserID()+"&fields=SortName&format=json");	
			GuiDisplayOneItem.start(ItemData.Items[selectedItem].Name,url,0,0);
			break;
		case "ChannelFolderItem":
			var url = Server.getCustomURL("/Channels/"+ItemData.Items[selectedItem].ChannelId+"/Items?userId="+Server.getUserID()+"&folderId="+ItemData.Items[selectedItem].Id+"&fields=SortName&format=json");	
			GuiDisplayOneItem.start(ItemData.Items[selectedItem].Name,url,0,0);
			break;	
		default:
			switch (ItemData.Items[selectedItem].MediaType) {
			case "Photo":
				GuiImagePlayer.start(ItemData,selectedItem);
				break;	
			case "Video":	
				var url = Server.getItemInfoURL(ItemData.Items[selectedItem].Id,null);
				GuiPage_ItemDetails.start(ItemData.Items[selectedItem].Name,url,0);
				break;
			default:
				Support.removeLatestURL();
				break;
			}
			break;
		}
	}
}

//-----------------------------------------------------------------------------------------------------------------------------------------


Support.scrollingText = function(divToScroll) {
	
	clearTimeout(Support.startScroll);
	clearTimeout(Support.resetToTop);
	clearInterval(Support.scroller);
	
	var div = $('#'+divToScroll+'');
	div.scrollTop(0);
	Support.scrollpos = 0;

	Support.startScroll = setTimeout(function(){		
		Support.scroller = setInterval(function(){
			var pos = div.scrollTop() + 1;
		    div.scrollTop(pos);
		    
		    if (Support.scrollpos == pos) {
		    	clearInterval(Support.scroller);
		    	Support.resetToTop = setTimeout(function(){	
		    		Support.scrollingText(divToScroll);
				}, 2000);
		    } else {
		    	Support.scrollpos = pos;
		    }	    
		}, 500);
	}, 2000);	
}

Support.generateMainMenu = function() {
	
	var menuItems = [];
	
	menuItems.push("Home");
	
	//Check Media Folders
	var urlMF = Server.getItemTypeURL("&Limit=0");
	var hasMediaFolders = Server.getContent(urlMF);
	if (hasMediaFolders == null) { return; }
		
	if (hasMediaFolders.TotalRecordCount > 0) {
		menuItems.push("Media-Folders");
	}
		
	//Check TV
	var urlTV = Server.getItemTypeURL("&IncludeItemTypes=Series&Recursive=true&Limit=0");
	var hasTV = Server.getContent(urlTV);
	if (hasTV == null) { return; }
		
	if (hasTV.TotalRecordCount > 0) {
		menuItems.push("TV");
	}
		
	//Check Movies
	var urlMovies = Server.getItemTypeURL("&IncludeItemTypes=Movie&Recursive=true&Limit=0");
	var hasMovies = Server.getContent(urlMovies);
	if (hasMovies == null) { return; }
		
	if (hasMovies.TotalRecordCount > 0) {
		menuItems.push("Movies");
	}
	//Check Music
	var urlMusic = Server.getItemTypeURL("&IncludeItemTypes=MusicArtist&Recursive=true&Limit=0");
	var hasMusic = Server.getContent(urlMusic);
	if (hasMusic == null) { return; }
	
	if (hasMusic.TotalRecordCount == 0) {
		var urlMusic2 = Server.getItemTypeURL("&IncludeItemTypes=MusicAlbum&Recursive=true&Limit=0");
		var hasMusic2 = Server.getContent(urlMusic2);
		if (hasMusic2 == null) { return; }
		
		if (hasMusic2.TotalRecordCount > 0) {
			if (Main.isMusicEnabled()) {
				menuItems.push("Music");
			}	
		}
	} else {
		if (Main.isMusicEnabled()) {
			menuItems.push("Music");
		}
	}
	
	//Check Live TV
	var urlLiveTV = Server.getCustomURL("/LiveTV/Info?format=json");
	var hasLiveTV = Server.getContent(urlLiveTV);
	if (hasLiveTV == null) { return; }
	if (Main.isLiveTVEnabled() && hasLiveTV.IsEnabled) {
		for (var index = 0; index < hasLiveTV.EnabledUsers.length; index++) {
			if (Server.getUserID() == hasLiveTV.EnabledUsers[index]) {
				menuItems.push("Live-TV");
				break;
			}
		}
	}
	
	//Check Channels
	if (Main.isChannelsEnabled()) {
		var urlChannels = Server.getCustomURL("/Channels?userId="+Server.getUserID()+"&format=json");
		var hasChannels = Server.getContent(urlChannels);
		if (hasChannels == null) { return; }
		
		if (hasChannels.Items.length > 0) {
			menuItems.push("Channels");
		}
	}
	
	//Check Collection
	var urlCollections = Server.getItemTypeURL("&IncludeItemTypes=BoxSet&Recursive=true&Limit=0");
	var hasCollections = Server.getContent(urlCollections);
	if (hasCollections == null) { return; }

	if (hasCollections.TotalRecordCount > 0 && Main.isCollectionsEnabled() == true) {
		menuItems.push("Collections");
	}
	return menuItems;
}

//-----------------------------------------------------------------------------------------------------------------------------------------
Support.processHomePageMenu = function (menuItem) {
	switch (menuItem) {
	case "Media-Folders":
		var url = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&CollapseBoxSetItems=false&fields=SortName");	
		GuiDisplayOneItem.start("Media Folders", url,0,0);
		break;
	case "Channels":
		var url = Server.getCustomURL("/Channels?userId="+Server.getUserID()+"&format=json");	
		GuiDisplayOneItem.start("Channels", url,0,0);
		break;
	case "Collections":	
		var url = Server.getItemTypeURL("&SortBy=SortName&SortOrder=Ascending&IncludeItemTypes=BoxSet&Recursive=true&fields=SortName");
		GuiDisplayOneItem.start("Collections", url,0,0);
		break;		
	case "TV":
		var url = Server.getItemTypeURL("&IncludeItemTypes=Series&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&CollapseBoxSetItems=false&recursive=true");
		GuiDisplay_Series.start("All Series",url,0,0);
		break;	
	case "Movies":
		var url = Server.getItemTypeURL("&IncludeItemTypes=Movie&SortBy=SortName&SortOrder=Ascending&fields=ParentId,SortName,Overview,Genres,RunTimeTicks&CollapseBoxSetItems=false&recursive=true");
		GuiDisplay_Series.start("All Movies",url,0,0);
		break;
	case "Music":
		var url = Server.getItemTypeURL("&IncludeItemTypes=MusicAlbum&Recursive=true&ExcludeLocationTypes=Virtual&fields=SortName&CollapseBoxSetItems=false");
		GuiDisplay_Series.start("Album",url,0,0);
		break;
	}
}

//-----------------------------------------------------------------------------------------------------------------------------------------
Support.screensaver = function () {
	if (Main.isScreensaverEnabled()) {
		clearTimeout(this.screensaverVar);
		this.screensaverVar  = setTimeout(function(){
			GuiImagePlayer_Screensaver.start();
		}, this.screensaverTime);
	}
}

Support.screensaverOff = function () {
	if (Main.isScreensaverEnabled()) {
		clearTimeout(this.screensaverVar);
	}
}

//-----------------------------------------------------------------------------------------------------------------------------------------
Support.convertTicksToTime = function (currentTime, duration) {
	 totalTimeHour = Math.floor(duration / 3600000);
    timeHour = Math.floor(currentTime / 3600000);
    totalTimeMinute = Math.floor((duration % 3600000) / 60000);
    timeMinute = Math.floor((currentTime % 3600000) / 60000);
    totalTimeSecond = Math.floor((duration % 60000) / 1000);
    timeSecond = Math.floor((currentTime % 60000) / 1000);
    timeHTML = timeHour + ":";

    if (timeMinute == 0) {
        timeHTML += "00:";
    } else if (timeMinute < 10) {
         timeHTML += "0" + timeMinute + ":";
    } else {
         timeHTML += timeMinute + ":";
    }

    if (timeSecond == 0) {
        timeHTML += "00/";
    } else if (timeSecond < 10) {
         timeHTML += "0" + timeSecond + "/";
    } else {
         timeHTML += timeSecond + "/";
    }
    timeHTML += totalTimeHour + ":";

    if (totalTimeMinute == 0) {
         timeHTML += "00:";
    } else if (totalTimeMinute < 10)
        timeHTML += "0" + totalTimeMinute + ":";
    else {
         timeHTML += totalTimeMinute + ":";

    }

    if (totalTimeSecond == 0) {
         timeHTML += "00";
    } else if (totalTimeSecond < 10) {
        timeHTML += "0" + totalTimeSecond;
    } else
        timeHTML += totalTimeSecond;
    
    return timeHTML;
}


Support.convertTicksToTimeSingle = function (currentTime) {
   timeHour = Math.floor(currentTime / 3600000);
   timeMinute = Math.floor((currentTime % 3600000) / 60000);
   timeSecond = Math.floor((currentTime % 60000) / 1000);
   timeHTML = timeHour + ":";

   if (timeMinute == 0) {
       timeHTML += "00:";
   } else if (timeMinute < 10) {
        timeHTML += "0" + timeMinute + ":";
   } else {
        timeHTML += timeMinute + ":";
   }

   if (timeSecond == 0) {
       timeHTML += "00";
   } else if (timeSecond < 10) {
        timeHTML += "0" + timeSecond;
   } else {
        timeHTML += timeSecond;
   }
   
   //ShowMin will show only the time without any leading 00
   if (timeHour == 0) {
	   timeHTML = timeHTML.substring(2,timeHTML.length);
   }
   
   return timeHTML;
}

Support.convertTicksToMinutes = function (currentTime) {
	timeMinute = Math.floor((currentTime / 3600000) * 60);
	return timeMinute + " mins";
}