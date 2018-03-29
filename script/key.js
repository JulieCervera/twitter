// Please enter your keys and tokens at the corresponding line (you must fill in between 'quotation mark')
// To generate keys and token, you must have a twitter account, login then create a twitter app (https://apps.twitter.com/app/new) with any information.
// You don't need to fill the app, only to create if. Once it is created enter the app.
// Finally access your keys and tokens in the Keys and Access Tokens tab.
// Make sure the information you write in this file are correct, otherwise you won't be able to run Led'sChat Twitter app
let Twitter = require('twitter');

let client = new Twitter({
    consumer_key: 'your_consumer_key_goes_here',
    consumer_secret: 'your_consumer_secret_goes_here',
    access_token_key: 'your_access_token_goes_here',
    access_token_secret: 'your_access_token_secret_goes_here'
});