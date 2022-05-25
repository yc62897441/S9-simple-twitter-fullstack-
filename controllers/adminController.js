const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Reply = db.Reply
const Like = db.Like

const adminController = {
  getTweets: (req, res) => {
    Tweet.findAll({ include: [User] })
      .then(tweets => {
        const data = tweets.map(d => ({
          ...d.dataValues,
        }))
        // 如果沒用上面的寫法，直接把tweets傳出去，同一個tweet的replies會被拆分開來，變成多個tweet個夾帶一個reply
        // 例如原本應該是 tweet1 :{replies: [reply1, reply2]}，會變成 tweet1: {reply1}、tweet2: {reply2}
        return res.render('admin/index', { tweets: data })
      })
  },

  deleteTweet: (req, res) => {
    const tweetId = req.params.id
    Tweet.findByPk(tweetId)
      .then(tweet => {
        tweet.destroy()
        .then(() => {
          return res.redirect('back')
        })
      })
  },

  getUsers: (req, res) => {
    User.findAll({ include: [Reply, Like, { model: User, as: 'Followers' }, { model: User, as: 'Followings' }] })
      .then(users => {
        const data = users.map(d => ({
          ...d.dataValues,
          replyNum: d.Replies.length,
          likeUserNum: d.Likes.length,
          followerNum: d.Followers.length,
          followingNum: d.Followings.length
        }))
        return res.render('admin/users', { users: data })
      })
  }
}

module.exports = adminController
