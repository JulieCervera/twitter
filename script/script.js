let ledschat = require('ledschat');
let webrtc = new ledschat.WebRTC();
let topology = ledschat.topology();
let emojiStrip = require('emoji-strip');
var start = 0;

let params = {
    // keyword to look up in twiSearch function
    q: '',
    // user name to look up in twiLookup function
    screen_name: '',
    // you can change the language of the tweets here
    lang: 'fr',
    count: '10',
    tweet_mode: 'extended',
    result_type: 'mixed'
}

let feed,
    windowWidth = topology.width * 10,
    windowHeight = topology.height * 10,
    policeHeight = 8,
    tweetContainer = document.querySelector('.tweet-container'),
    tweetSearch = document.querySelector('.tweet-search'),
    tweetMessage = document.querySelectorAll('.tweet-message'),
    tweetAuthor = document.querySelector('.tweet-author'),
    tweetUser = document.querySelector('.tweet-user'),
    likes = document.querySelector('.likes'),
    tweetFollower = document.querySelector('.tweet-follower'),
    followers = document.querySelector('.followers'),
    tweetList = [],
    followerCount = 0,
    intervalDown,
    intervalLeft,
    intervalRight,
    intervalPing,
    intervalPong,
    interWidth = -windowWidth,
    interHeight = windowHeight,
    elemWidth,
    speed = 40,
    errorMessage;


// Display pertinent tweets with the query term q
function twiSearch(params) 
{
    client.get('search/tweets', params, function (error, tweets, response) {
        if (error) {
            sendError(error);
            return;
        }
        tweetsCycle(tweets, 0);
    });
}

function tweetsCycle(tweets, index) 
{
    console.log(tweets);
    
    if (tweets.statuses.length === 0) 
    {
        console.log(error);
        
        webrtc.send({
            cmd: 'error',
            arg: 'No tweet match your keyword, please try again'
        });
    } 
    else 
    {        
        if (tweets >= tweets.statuses.length) 
        {
            index = 0;
        }
        if (!tweets.hasOwnProperty('retweeted_status')) 
        {
            tweetAuthor.textContent = emojiStrip(tweets.statuses[index].user.screen_name);
            let tweetContent = emojiStrip(tweets.statuses[index].full_text + ' -  ');
            tweetContent = tweetContent.replace(/[^\x00-\xFF]/g, "");

            for (let i = 0; i < tweets.statuses[index].entities.hashtags.length; i++) 
            {
                let regex = new RegExp('#' + tweets.statuses[index].entities.hashtags[i].text, "ig");
                let hashtag = '<span class="hashtag"> #' + tweets.statuses[index].entities.hashtags[i].text + '</span>';
                tweetContent = tweetContent.replace(regex, hashtag);
            }

            for (let i = 0; i < tweets.statuses[index].entities.user_mentions.length; i++) 
            {
                let regex = new RegExp('@' + tweets.statuses[index].entities.user_mentions[i].screen_name, "ig");
                let mentions = '<span class="mentions">@' + tweets.statuses[index].entities.user_mentions[i].screen_name + '</span>';
                tweetContent = tweetContent.replace(regex, mentions);
            }
            let regex = new RegExp(params.q, "ig");
            let query = '<span class="query">' + params.q + '</span>';
            tweetContent = tweetContent.replace(regex, query);
            tweetSearch.style.left = windowWidth + 'px';
            tweetMessage[0].innerHTML = tweetContent;
        }
        window.setTimeout(scroll.bind(undefined, tweetSearch, tweetsCycle.bind(undefined, tweets, index + 1)), 1000);
    }
}


function twiLookup(params) 
{
    client.get('users/lookup', params, function (error, users, response) {
        if (error) {
            sendError(error);
            return;
        }
        if (feed === 'user') 
        {
            getFollowers(twiTimeline.bind(undefined, params));
        } 
        else if (feed === 'follower') 
        {
            getFollowers(displayFollowers);
        }

        function getFollowers(callback) 
        {
            followerCount = users[0].followers_count;
            let followerPt = '';
            let followerCountStr = followerCount.toString();
            var modulo = followerCountStr.length % 3;
            if (modulo > 0) 
            {
                followerPt = followerCountStr.substring(0, modulo) + ',';
            }
            for (let index = modulo; index < followerCountStr.length; index = index + 3) 
            {
                followerPt = followerPt + followerCountStr.substring(index, index + 3) + ',';
            }
            followerPt = followerPt.substring(0, followerPt.length - 1)
            followers.innerHTML = followerPt;
            tweetFollower.style.display = 'flex';
            tweetFollower.style.bottom = interHeight + 'px';
            tweetFollower.style.right = interWidth + 'px';            
            window.setTimeout(callback, 2000);
        }
    });
}

function displayFollowers() 
{
    elemWidth = tweetFollower.clientWidth;
    window.clearInterval(intervalDown);
    window.clearInterval(intervalLeft);
    window.clearInterval(intervalRight);
    window.clearInterval(intervalPing);
    window.clearInterval(intervalPong);
    start = Date.now();
    if (windowWidth - elemWidth > 0) 
    {
        if (windowWidth - elemWidth < 10) 
        {
            tweetFollower.style.right = '2px';
            intervalDown = window.setInterval(scrollDown, speed+10);
        } 
        else 
        {
            tweetFollower.style.bottom = '0px';
            intervalLeft = window.setInterval(scrollLeft, speed);
        }
    } 
    else if (elemWidth - windowWidth >= 0) 
    {
        tweetFollower.style.bottom = '0px';
        intervalPong = window.setInterval(scrollPong, speed);
    }

    function scrollDown() 
    {
        interHeight = interHeight - 1;
        tweetFollower.style.bottom = interHeight + 'px';
        if (interHeight == -windowHeight) interHeight = windowHeight;
    }

    function scrollPong() 
    {
        let millis = Date.now() - start;
        let position = (millis/speed);
        tweetFollower.style.right = interWidth + 'px';
        interWidth = interWidth + position;
        start = Date.now();
        if (interWidth >= elemWidth - windowWidth) 
        {
            window.clearInterval(intervalPong);
            intervalPing = window.setInterval(scrollPing, speed);
        }

        function scrollPing() 
        {
            let millis = Date.now() - start;
            let position = (millis/50);    
            tweetFollower.style.right = interWidth + 'px';
            interWidth = interWidth - position;
            start = Date.now();
            if (interWidth <= 0) 
            {
                window.clearInterval(intervalPing);
                intervalPong = window.setInterval(scrollPong, speed);
            }
        }
    }
    function scrollLeft() 
    {
        let millis = Date.now() - start;
        let position = millis/speed; 
        tweetFollower.style.right = interWidth + 'px';
        interWidth = interWidth + position;
        start = Date.now();
        if (interWidth >= 0) 
        {
            window.clearInterval(intervalLeft);
            window.clearInterval(intervalRight);
            intervalRight = window.setInterval(scrollRight, speed);
        }
    }
    function scrollRight() 
    {
        let millis = Date.now() - start;
        let position = millis/50;
        tweetFollower.style.right = interWidth + 'px';
        interWidth = interWidth - position;
        start = Date.now();
        if (interWidth < elemWidth - windowWidth) 
        {
            window.clearInterval(intervalLeft);
            window.clearInterval(intervalRight);
            intervalLeft = window.setInterval(scrollLeft, speed);
        }
    }
}


// Get count parameters number of recent tweets of a defined user 
function twiTimeline(params) 
{
    client.get('statuses/user_timeline', params, function (error, tweets, response) 
    {
        if (error) 
        {
            console.log(error);
            sendError(error);
            return;
        }
        tweetList = [];
        for (let index = 0; index < tweets.length; index++) 
        {
            let tweet = {};
            tweet.hashtags = tweets[index].entities.hashtags;
            tweet.mentions = tweets[index].entities.user_mentions;
            tweet.text = tweets[index].full_text;
            tweet.likes = tweets[index].favorite_count;
            tweetList.push(tweet);
        }
        window.setTimeout(displayLastsTweets(tweetList, 0),2000);
    });
}

// Display list of tweets
function displayLastsTweets(tweetList, index) 
{
    console.log(tweetList);
    
    if (index === tweetList.length) setFollower();
    else 
    {        
        let tweetContent = emojiStrip(tweetList[index].text);
        tweetContent = tweetContent.replace(/[^\x00-\xFF]/g, "");

        for (let i = 0; i < tweetList[index].hashtags.length; i++) 
        {
            let regex = new RegExp('#' + tweetList[index].hashtags[i].text, "ig");
            let hashtag = '<span class="hashtag"> #' + tweetList[index].hashtags[i].text + '</span>';
            tweetContent = tweetContent.replace(regex, hashtag);
        }
        for (let i = 0; i < tweetList[index].mentions.length; i++) 
        {
            let regex = new RegExp('@' + tweetList[index].mentions[i].screen_name, "ig");
            let mentions = '<span class="mentions">@' + tweetList[index].mentions[i].screen_name + '</span>';
            tweetContent = tweetContent.replace(regex, mentions);
        }
        tweetMessage[1].innerHTML = tweetContent;
        likes.textContent = tweetList[index].likes;
        tweetUser.style.left = windowWidth + 'px';
        window.setTimeout(scroll.bind(undefined, tweetUser, displayLastsTweets.bind(undefined, tweetList, index + 1)),1000);
    }
}

function setFollower() {
    followers.innerHTML = followerCount;
    scroll(tweetFollower, displayLastsTweets.bind(undefined, tweetList, 0));
}

function scroll(elem, callback) 
{
    window.clearInterval(intervalLeft);
    window.clearTimeout(intervalDown);
    tweetContainer.width = '100%';
    elem.style.display = 'flex';
    let elemWidth = elem.clientWidth;    
    let interWidth = windowWidth;
    let interHeight = (windowHeight / 2 + policeHeight / 2);
    if (elemWidth < interWidth) 
    {
        intervalDown = window.setTimeout(scrollDown, speed);
        tweetFollower.style.bottom = (windowHeight / 2 + policeHeight / 2) + 'px';
    }
    else 
    {
        intervalLeft = window.setTimeout(scrollLeft, speed);
        start = Date.now();
    }

    function scrollLeft() 
    {
        let millis = Date.now() - start;
        let position = (millis / speed);
        elem.style.left = interWidth + 'px';
        interWidth = interWidth - position;
        start = Date.now();        
        if (interWidth <= -elemWidth) 
        {            
            elem.style.display = 'none';
            callback();
            return;
        } 
        else intervalLeft = window.setTimeout(scrollLeft, speed);
    }

    function scrollDown() {
        interHeight = interHeight - 1;
        elem.style.bottom = interHeight + 'px';
        if (interHeight == -(windowHeight / 2 + policeHeight / speed))
        {
            elem.style.display = 'none';
            callback();
            return;
        } 
        else if (interHeight == 0) window.setTimeout(scrollDown, 1500);
        else window.setTimeout(scrollDown, speed);
    }
}


// Indicate the user of an error
function sendError(error) 
{
    if (error[0] !== undefined) 
    {
        errorMessage = error[0].message;
    }
    else
    { 
        errorMessage = '';
    }
    webrtc.send({
        cmd: 'error',
        arg: errorMessage
    });
}

webrtc.onData((data) => 
{
    if (data.feed === 'user') 
    {
        tweetSearch.style.display = 'none';
        feed = 'user';
        params.screen_name = data.user;
        window.clearInterval(intervalDown);
        window.clearInterval(intervalLeft);
        window.clearInterval(intervalRight);
        window.clearInterval(intervalPing);
        window.clearInterval(intervalPong);
        twiLookup(params);
    }
    if (data.feed === 'follower') 
    {
        tweetSearch.style.display = 'none';
        tweetUser.style.display = 'none';
        feed = 'follower';
        params.screen_name = data.user;
        window.clearInterval(intervalDown);
        window.clearInterval(intervalLeft);
        window.clearInterval(intervalRight);
        window.clearInterval(intervalPing);
        window.clearInterval(intervalPong);
        twiLookup(params);
    }
    if (data.feed === 'search') 
    {
        tweetUser.style.display = 'none';
        tweetFollower.style.display = 'none';
        feed = 'search';
        params.q = data.keyword;
        window.clearInterval(intervalDown);
        window.clearInterval(intervalLeft);
        window.clearInterval(intervalRight);
        window.clearInterval(intervalPing);
        window.clearInterval(intervalPong);
        twiSearch(params);
    }
    if (data.cmd === 'TweetNumber') 
    {        
        params.count = parseInt(data.arg,10);
    }
    if (data.cmd === 'Speed') 
    {
        switch (parseInt(data.arg,10)) 
        {
            case 1:
                speed = 70;
                break;
            case 2:
                speed = 50;
                break
            case 3:
                speed = 40;
                break;
            case 4:
                speed = 30;
                break;
            case 5:
                speed = 20;
                break;
            default:
                speed = 40;        
                break;
        }
    }
});