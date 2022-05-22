const db = require('../models')
const User = db.User
const Tweet = db.Tweet

const tweetController = {
  getTweets: (req, res) => {
    Tweet.findAll({ include: [User], raw: true, nest: true })
      .then(tweets => {
        return res.render('index', { tweets })
      })
  },

  postTweet: (req, res) => {
    Tweet.create({
      UserId: req.user.id,
      description: req.body.tweet
    })
      .then(tweet => {
        return res.render('index')
      })
  }
}

module.exports = tweetController
