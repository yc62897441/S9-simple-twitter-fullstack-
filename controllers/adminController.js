const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Reply = db.Reply
const Like = db.Like
const { Op } = require('sequelize')

const adminController = {
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
        return res.render('admin/index', { tweets: data })
      })
  },
}

module.exports = adminController
