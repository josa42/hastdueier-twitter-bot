const Twitter = require('twitter')
const request = require('request-promise-native')
const entities = require('entities')

var client = new Twitter({
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});


client.stream('statuses/filter', {track: '#hastdueier'}, function(stream) {
  stream.on('data', async (tweet) => {

    if (tweet.user.screen_name === 'hastdueier') {
      return;
    }

    console.log(JSON.stringify({
      id: tweet.id,
      id_str: tweet.id_str,
      status: tweet.status
    }, null, '  '))

    let answer = await request('http://localhost:8000/api/answer.php', { json: true })

    const reply = `@${tweet.user.screen_name} ${entities.decodeHTML(answer.title)} ${answer.description || ''} ${answer.mediaUrl || ''} https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`

    console.log(`> ${reply}`)

    // console.log(JSON.stringify(tweet, null, '  '))
    // console.log(JSON.stringify(tweet, null, '  '))

    client.post('statuses/update', { status: reply, in_reply_to_status_id:tweet.id_str },  function(error, tweetReply, response){

      //if we get an error print it out
      if(error){
        console.log(error);
      }

      //print the text of the tweet we sent out
      console.log(tweetReply.text);
    });
  });

  stream.on('error', function(error) {
    console.log(error);
  });
});

// client.stream('statuses/filter', {track: '#habicheier'}, function(stream) {
//   stream.on('data', function(tweet) {
//     console.log(tweet.text);
//   });

//   stream.on('error', function(error) {
//     console.log(error);
//   });
// });