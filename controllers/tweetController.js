const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Reply = db.Reply

const tweetController = {
  getTweets: (req, res) => {
    Tweet.findAll({ include: [User, { model: Reply, include: [User] }] })
      .then(tweets => {
        const data = tweets.map(d => ({
          ...d.dataValues,
        }))
        return res.render('index', { tweets: data })
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
  },

  postReply: (req, res) => {
    Reply.create({
      UserId: req.user.id,
      TweetId: req.params.id,
      comment: req.body.comment
    })
      .then(reply => {
        res.redirect('/tweets')
      })
  }
}

module.exports = tweetController
