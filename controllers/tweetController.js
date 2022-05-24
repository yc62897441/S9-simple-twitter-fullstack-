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
          isUserliked: d.Likes.map(d => d.User.dataValues.id).includes(userId),
          replyNum: d.Replies.length,
          likeUserNum: d.Likes.length
        }))
        // 如果沒用上面的寫法，直接把tweets傳出去，同一個tweet的replies會被拆分開來，變成多個tweet個夾帶一個reply
        // 例如原本應該是 tweet1 :{replies: [reply1, reply2]}，會變成 tweet1: {reply1}、tweet2: {reply2}
        return res.render('index', { tweets: data })
      })
  },

  getTweet: (req, res) => {
    const userId = req.user.id
    const tweetId = req.params.id
    Tweet.findOne({
      where: { id: tweetId },
      include: [User, { model: Reply, include: [User] }, { model: Like, include: [User] }]
    })
      .then(tweet => {
        console.log('tweet', tweet)
        const data = {
          ...tweet.dataValues,
          isUserliked: tweet.Likes.map(d => d.User.dataValues.id).includes(userId),
          replyNum: tweet.Replies.length,
          likeUserNum: tweet.Likes.length
        }
        console.log('data', data)
        return res.render('tweet', { tweet: data })
      })
  },

  postTweet: (req, res) => {
    Tweet.create({
      UserId: req.user.id,
      description: req.body.tweet
    })
      .then(tweet => {
        return res.redirect('back')
      })
  },

  postReply: (req, res) => {
    Reply.create({
      UserId: req.user.id,
      TweetId: req.params.id,
      comment: req.body.comment
    })
      .then(reply => {
        return res.redirect('back')
      })
  },

  likeTweet: (req, res) => {
    Like.create({
      UserId: req.user.id,
      TweetId: req.params.id
    })
      .then(like => {
        res.redirect('back')
      })
  },

  unlikeTweet: (req, res) => {
    Like.findOne({ where: { UserId: req.user.id, TweetId: req.params.id } })
      .then(like => {
        like.destroy()
          .then(() => {
            res.redirect('back')
          })
      })
  }
}

module.exports = tweetController
