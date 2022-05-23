const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Reply = db.Reply
const Like = db.Like

const tweetController = {
  getTweets: (req, res) => {
    const userId = req.user.id
    Tweet.findAll({ include: [User, { model: Reply, include: [User] }, { model: Like, include: [User] }] })
      .then(tweets => {
        const data = tweets.map(d => ({
          ...d.dataValues,
          likeUsers: d.Likes.map(d => d.User.dataValues.id).length,
          isUserliked: d.Likes.map(d => d.User.dataValues.id).includes(userId)
        }))
        // 如果沒用上面的寫法，直接把tweets傳出去，同一個tweet的replies會被拆分開來，變成多個tweet個夾帶一個reply
        // 例如原本應該是 tweet1 :{replies: [reply1, reply2]}，會變成 tweet1: {reply1}、tweet2: {reply2}
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
  },

  likeTweet: (req, res) => {
    Like.create({
      UserId: req.user.id,
      TweetId: req.params.id
    })
      .then(like => {
        res.redirect('/tweets')
      })
  },

  unlikeTweet: (req, res) => {
    Like.findOne({ where: { UserId: req.user.id, TweetId: req.params.id } })
      .then(like => {
        like.destroy()
          .then(() => {
            res.redirect('/tweets')
          })
      })
  }
}

module.exports = tweetController
