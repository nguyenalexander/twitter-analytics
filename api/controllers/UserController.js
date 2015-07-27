// api/controllers/UserController.js

var CronJob = require('cron').CronJob;
var update = require('../helpers/updateData');
// var async = require('async')
var _ = require('lodash')


module.exports = {

  index: function(req, res){
    User.find().then(function(users) {
      res.send(users);
    });
  },

  create: function(req, res) {
    console.log(req.body.email, req.body.password);
    User.create({email: req.body.email, password: req.body.password}).then(function(user) {
      res.send(user);
    });
  },

  updateTracker: function(req, res) {
    var trackerType = req.params.tracker;

    if(trackerType == 'influencer') {
      var influencers = req.body.influencers;
      console.log('sent influencers:', influencers)
      console.log('user id:', req.session.user.id)
      Twitter_Account.findOne({user: req.session.user.id}).populate('trackers').exec(function(err, twitterAcc){
        console.log('found twitter account:', twitterAcc)
        Tracker.findOrCreate({name: influencer.screen_name}, {name: influencer.screen_name, type: 'influencer', twitter_accounts: twitterAcc.id}).exec(function(err, addedInfluencer){
          console.log('added influencer:', addedInfluencer)
          if (!Array.isArray(twitterAcc.trackers)) {
            twitterAcc.trackers = [];
          }
          twitterAcc.trackers.push(addedInfluencer);
          twitterAcc.save();
          res.send({addedInfluencer: addedInfluencer, trackers: twitterAcc.trackers})
        })
      })
    }
    else if (trackerType == 'hashtag') {
      var hashtag = req.body.hashtag;
      console.log('sent hashtag:', hashtag)
      console.log('user id:', req.session.user.id)
      Twitter_Account.findOne({user: req.session.user.id}).populate('trackers').exec(function(err, twitterAcc){
        console.log('found twitter account:', twitterAcc)
        Tracker.findOrCreate({name: hashtag}, {name: hashtag, type: 'hashtag', twitter_accounts: twitterAcc.id}).exec(function(err, addedHashtag){
          console.log('added hashtag:', addedHashtag)
          if (!Array.isArray(twitterAcc.trackers)) {
            twitterAcc.trackers = [];
          }
          twitterAcc.trackers.push(addedHashtag);
          twitterAcc.save();
          res.send({addedHashtag: addedHashtag, trackers: twitterAcc.trackers})
        })
      })
    }
  },

  emailToggle: function(req, res) {
    User.findOne({id: req.session.user.id}).exec(function(err, user) {
      if(err) {
        console.log('\n*****************************************************************\n** Email Toggle failed\n*****************************************************************\n')
        res.send(false);
      } else {
        console.log('\n*****************************************************************\n** Email Toggle set'+req.body.emailToggle+'\n*****************************************************************\n')
        user.emailToggle = req.body.emailToggle;
        user.save();
        res.send(true);
      }
    });
  },

  emailUpdate: function(req, res) {
    User.findOne({id: req.session.user.id}).exec(function(err, user) {
      if(err) {
        console.log('\n*****************************************************************\n** Email update failed\n*****************************************************************\n')
        res.send(false);
      } else {
        console.log('\n*****************************************************************\n** Email update set\n*****************************************************************\n')
        user.email = req.body.email;
        user.save();
        res.send(user.email);
      }
    });
  },


  retrieve: function(req, res) {
    console.log('inside of user retrieve function', req.session.user)
    async.auto({
      twitterAccount: function(callback){
        Twitter_Account.find({user: req.session.user.id}).populate('tweetCollections').populateAll().exec(function(err, user){
          console.log('first cb:',user)
          callback(null, user[0])
        });
      },
      collectionTweets: ['twitterAccount', function(callback, twitterAccount){
        console.log('second cb:',twitterAccount)
        async.map(twitterAccount.twitterAccount.tweetCollections, function(tweetCollection, innercb){
          TweetCollection.find({id: tweetCollection.id}).populate('tweets').exec(function(err, data){
            console.log('inner cb:', data)
            innercb(null, data[0]);
          });
        }, function(err, results){
          callback(null, results)
        })
      }],
    }, function(err, result) {
      // console.log('err is:', err)
      // console.log('results: ', result)
      res.send(result)
    })
    // Twitter_Account.findOne({user: req.session.user.id}).populate('tweetCollections')
    // .then(function(twitterAcc) {
    //   var tweets = TweetCollection.find({
    //     tweets: _.pluck(twitterAcc.tweetCollections, 'tweets')
    //   })
    //   .then(function(tweets){
    //     console.log('retrieved tweets:', tweets)
    //     return tweets;
    //   });
    //   console.log('retrieved tweets (after promise) :', tweets)
    //   return [twitterAcc, tweets]
    // })
    // .spread(function(twitterAcc, tweets) {
    //   var tweets = _.indexBy(tweets, 'tweet_id');
    //   twitterAcc.tweetCollections = _.map(twitterAcc.tweetCollections, function(collection){
    //     collection.tweets = tweets[twitterAcc.tweetCollections];
    //     return collection;
    //   })
    //   res.json(twitterAcc)
    // })
    // .catch(function(err){
    //   if (err) {
    //     return res.send(err)
    //   }
    // })
  },

  update: function(req, res) {


    // var formatDates = function(entities) {
    //   if (!Array.isArray(entities)) {
    //     entities = [entities];
    //   }

    //   entities.forEach(function(entity) {

    //     // check http://momentjs.com/docs/#/displaying/
    //     entity.created_at = moment(Date.parse(entity.created_at)).format("D, M, YY, HHH, ddd");
    //     console.log(entity.created_at)
    //   });
    // }


    /*******************************************************************************
    * Testing methods for cron jobs
    * Delete at any time
    *******************************************************************************/
    // const TIMEZONE = 'America/Los_Angeles';
    // // logs a message every five seconds
    // new CronJob('*/5 * * * * *', function() {
    //   console.log(new Date(), 'You will see this message every 5 seconds.');
    // }, null, true, TIMEZONE);

    // // logs a message every minute
    // new CronJob('00 * * * * *', function() {
    //   console.log(new Date(), 'You will see this message every minute.');
    // }, null, true, TIMEZONE);

    // every ten seconds, this will make an API call and then email the result

    /*******************************************************************************
    * Alex comment
    *******************************************************************************/

    User.findOne({id: req.params.id}).then(function(user){
      console.log('user retrieve function', user)
      Passport.find({user: user.id}).then(function(passport){
        update.getMyUser({}, user.username, req, res)
      })
    })

  }
};
