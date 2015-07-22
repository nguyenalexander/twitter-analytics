var moment = require("moment");
var nodemailer = require("nodemailer");

module.exports = {
  /*******************************************************************************
  * helper method for marking top tweet(s) with highest retweet + favourite count
  * with a top_tweet: true property
  *
  * return first top tweet

        // $scope.overlayData = {
    //     $scope.lineLabels: ["July"],
    //     $scope.lineDatasets: [
    //       {
    //         label: "total followers",
    //         type: "bar",
    //         fillColor: "rgba(128, 128, 128, 0.4)",
    //         strokeColor: "rgba(128, 128, 128, 0.8)",
    //         highlightFill: "rgba(228, 135, 27, 0.75)",
    //         highlightStroke: "rgba(228, 135, 27, 1)",
    //         data: [$scope.user.myUser.followers_count]
    //       },
    //       {
    //         label: "engagements per post",
    //         type: "line",
    //         fillColor: "rgba(192, 192, 192,0.4)",
    //         strokeColor: "rgba(192, 192, 192,0.8)",
    //         pointColor: "rgba(192, 192, 192,1)",
    //         pointStrokeColor: "#fff",
    //         pointHighlightFill: "#fff",
    //         pointHighlightStroke: "rgba(110,110,110,1)",
    //         data: [65]
    //       }
    //     ]
    //   };

    //   $scope.barData = {
    //     labels: ["July"],
    //     datasets: [
    //       {
    //         label: "total tweets",
    //         fillColor: "rgba(160, 160, 160, 0.4)",
    //         strokeColor: "rgba(160, 160, 160, 0.8)",
    //         highlightFill: "rgba(228, 135, 27, 0.75)",
    //         highlightStroke: "rgba(228, 135, 27, 1)",
    //         data: [$scope.user.myUser.statuses_count]
    //       }
    //     ]
    //   };

    //   $scope.doughnutData = [
    //     {
    //       value: 125,
    //       color:"rgb(96, 96, 96)",
    //       highlight: "rgb(228, 135, 27)",
    //       label: "replies"
    //     },
    //     {
    //       value: 100,
    //       color: "rgb(160, 160, 160)",
    //       highlight: "rgb(228, 135, 27)",
    //       label: "retweets"
    //     },
    //     {
    //       value: 50,
    //       color: "rgb(128, 128, 128)",
    //       highlight: "rgb(228, 135, 27)",
    //       label: "links"
    //     },
    //     {
    //       value: 75,
    //       color: "rgb(192, 192, 192)",
    //       highlight: "rgb(228, 135, 27)",
    //       label: "hashtags"
    //     }
    //   ]
  *******************************************************************************/

  markTopTweets: function(tweets) {
    var topCount = 0;
    var topIndices = [];

    tweets.forEach(function(tweet, index) {
      var thisCount = tweet.retweet_count + tweet.favorite_count;
      tweet.engagements = thisCount;
      if (thisCount > topCount) {
        topCount = thisCount;
        topIndices = [index];
      } else if (thisCount == topCount) {
        topIndices.push(index);
      }
    });

    topIndices.forEach(function(topIndex) {
      tweets[topIndex].top_tweet = true;
    });

    return tweets[topIndices[0]];
  },

  /*******************************************************************************
  * helper method for formatting dates
  *******************************************************************************/

  formatDates: function(entities) {
    if (!Array.isArray(entities)) {
      entities = [entities];
    }

    entities.forEach(function(entity) {

      // check http://momentjs.com/docs/#/displaying/
      entity.date = moment(Date.parse(entity.created_at)).format("D, M, YY, HHH, ddd");
    });
  },

  /*******************************************************************************
  * helper method to convert an array of text descriptions
  * into an array of objects, sorted from highest to lowest count.
  * The object format is [ {word: "string1", count: n}, ... ].
  *******************************************************************************/

  sortedArrayOfWordCounts: function(strings) {
    if(!strings) return;

    // Convert array to a long string
    strings = strings.join(' ');

    // Strip stringified objects and punctuations from the string
    strings = strings.toLowerCase().replace(/object Object/g, '').replace(/[\+\.,\/#!$%\^&\*{}=_`~]/g,'');

    // Convert the str back into an array
    strings = strings.split(' ');

    // Count frequency of word occurrence
    var wordCount = {};

    for(var i = 0; i < strings.length; i++) {
      if (!wordCount[strings[i]])
          wordCount[strings[i]] = 0;

      wordCount[strings[i]]++; // {'hi': 12, 'foo': 2 ...}
    }

    var wordCountArr = [];

    for(var prop in wordCount) {
      wordCountArr.push({word: prop, count: wordCount[prop]});
    }

    // sort based on count, largest first
    wordCountArr.sort(function(objectA, objectB) {
      return objectB.count - objectA.count;
    });

    return wordCountArr;
  },


  /*******************************************************************************
  * helper method for sending email through Gmail
  *******************************************************************************/

  sendEmail: function(email_to, subject, content, callback) {
    var smtpTransport = nodemailer.createTransport("SMTP", {
      service: "Gmail",
      auth: {
        user: process.env.GMAIL_ADDRESS,
        pass: process.env.GMAIL_PASSWORD
      }
    });

    var mailOptions = {
      to: email_to,
      subject: subject,
      text: content
    }

    smtpTransport.sendMail(mailOptions, function(error, response) {
      if (callback) {
        callback(error, response);
      }
    });
  }

}