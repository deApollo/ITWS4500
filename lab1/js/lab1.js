var jsonFileGlobal = "tweetsFromTwitter.json"; //filename of the json file to load the tweet information from
var jsonGlobal = ""; //global variable where the json data will be stored
var hashtagsGlobal = ""; //global variable where a list of extracted hashtags will be stored
var numElementsGlobal = 5; //number of tweets to display
var numTagsGlobal = 8; //number of hashtags to display
var currentTweet = 0; //global counter variable for the most recent tweet displayed
var currentTag = 0; //global counter variable for the most recent hashtag displayed
var nextToDeleteTweet = 0; //the identifier number of the tweet to delete from the page in order to cycle in the next tweet
var nextToDeleteTag = 0; //the identifier number of the hashtag to delete from the page in order to cycle in the next hashtag
var nextTweet = 0; //counter variable to keep track of what hashtag to display next

/*
	Function that writes "numElements" number of tweets to the tweets div.
		-This function is what is used to create the initial five tweets
		-This function's possible uses are not restricted to creating the initial tweets
*/
function drawTweets(numElements) {
  for (var i = currentTweet; i < currentTweet + numElements; i++) {
    var curTweet = jsonGlobal[i];
    var text = curTweet["text"];
    var prof_img = curTweet["user"]["profile_image_url"];
    $("#tweets").prepend('<li class="list-group-item" id="tweetElement' + i + '">' + '<img src="' + prof_img + '" title="' + curTweet["user"]["description"] + '"> ' + text + '</li>');
  }
  currentTweet += numElements - 1;
}

/*
	Function that removes the oldest tweet and then places the newest tweet in the tweets div
*/
function drawNextTweet() {
  $("#tweetElement" + nextToDeleteTweet).hide(200, function() {
    $("#tweetElement" + nextToDeleteTweet).remove();
    nextToDeleteTweet += 1;
    currentTweet += 1;
    if (currentTweet > jsonGlobal.length)
      currentTweet = 0
    if (nextToDeleteTweet > jsonGlobal.length)
      nextToDeleteTweet = 0;
    var curTweet = jsonGlobal[currentTweet];
    var text = curTweet["text"];
    var prof_img = curTweet["user"]["profile_image_url"];
    var final_html = '<li style="display:none;" class="list-group-item" id="tweetElement' + currentTweet + '">' + '<img src="' + prof_img + '" title="' + curTweet["user"]["description"] + '" onError="this.onerror=null;this.src=\'backup_img.png\'"> ' + text + '</li>';
    $("#tweets").prepend(final_html);
    $("#tweetElement" + currentTweet).show(200);
  });
}

/*
	Function that writes "numTags" number of hashtags to the hashtags div.
		-This function is what is used to create the initial 8 hashtags
		-This function's possible uses are not restricted to creating the initial hashtags
*/
function drawHashtags(numTags) {
  var hashtags = fishForHashtags(numTags);
  for (var i = 0; i < hashtags.length; i++) {
    $("#tags").prepend('<li class="list-group-item" id="tagElement' + (currentTag + i) + '"> <a target="_blank" href="https://twitter.com/hashtag/' + hashtags[i].substring(1, hashtags[i].length) + '">' + hashtags[i] + '</a></li>');
  }
  currentTag += hashtags.length - 1;
}

/*
	Function that removes the oldest hashtag and then places the newest hashtag in the hashtags div
*/
function drawNextHashtag(numTags) {
  $("#tagElement" + nextToDeleteTag).hide(200, function() {
    var hashtags = fishForHashtags(1);
    $("#tagElement" + nextToDeleteTag).remove();
    nextToDeleteTag += 1;
    currentTag += 1;
    var curTweet = jsonGlobal[currentTweet];
    $("#tags").prepend('<li style="display:none;" class="list-group-item" id="tagElement' + (currentTag) + '"> <a target="_blank" href="https://twitter.com/hashtag/' + hashtags[0].substring(1, hashtags[0].length) + '">' + hashtags[0] + '</a></li>');
    $("#tagElement" + currentTag).show(200);
  });
}

/*
	Function that is used to extract hashtags from the initial json data
		-Uses a regex on both the tweet text and user description to extract all possible hashtags in a nice format
		-Regex is as follows: find a hashtag followed by an arbitrary amount of words terminated by a newline or a space.
		-the /g flag is applied to account for multiple hashtags in a single string
		-This function is used initially to populate the hashtagsGlobal variable
*/
function slurpTags() {
  var pattern = /#\w*(\s|\n)/g;
  var hashtags = [];
  for (i = 0; i < jsonGlobal.length; i++) {
    var tweetText = jsonGlobal[i]["text"];
    var descText = jsonGlobal[i]["user"]["description"];

    var tweetTextSearchRes;
    while ((tweetTextSearchRes = pattern.exec(tweetText)) !== null) {
      hashtags.push(tweetTextSearchRes[0]);
    }

    while ((tweetTextSearchRes = pattern.exec(descText)) !== null) {
      hashtags.push(tweetTextSearchRes[0]);
    }

  }
  return hashtags
}

/*
	Function that returns the next available "numberOfTags" hashtags from the hashtagsGlobal variable
*/
function fishForHashtags(numberOfTags) {
  var i = 0;
  var hashtags = [];
  if (nextTweet > hashtagsGlobal.length)
    nextTweet = 0;
  for (i = nextTweet; i < hashtagsGlobal.length; i++) {
    if (hashtags.length >= numberOfTags)
      break;
    hashtags.push(hashtagsGlobal[i]);
  }
  nextTweet += i;
  return hashtags;
}

/*
	Initial setup function called if the json file is successfully retrieved from the server
*/
function handleSetup(json) {
  jsonGlobal = json;
  hashtagsGlobal = slurpTags();
  drawTweets(numElementsGlobal);
  drawHashtags(numTagsGlobal);
  setInterval(drawNextTweet, 3000);
  setInterval(drawNextHashtag, 1500);
}

/*
	Initial request to the server for the json resource file
*/
$(document).ready(function() {
  $.ajax({
    dataType: "json",
    url: jsonFileGlobal,
    success: handleSetup
  });
});
