const db = require('../models')
const User = db.User
const Tweet = db.Tweet
const Reply = db.Reply
const Like = db.Like
const { Op } = require('sequelize')

const bcrypt = require('bcryptjs')

const userController = {
  signupPage: (req, res) => {
    return res.render('signup')
  },

  signup: (req, res) => {
    const { name, email, password, passwordConfirm } = req.body
    const messages = []

    // 確認密碼是否一致
    if (password !== passwordConfirm) {
      messages.push('密碼輸入不一致')
      return res.render('signup', { name, email, password, passwordConfirm, messages })

      // 使用 req.flash() 需搭配 res.redirect()，如此就不能回傳使用者填入表單的資訊到頁面上了
      // req.flash('error_messages', '密碼輸入不一致')
      // return res.redirect('/signup', { name, email, password, passwordConfirm })
    }

    // 確認 email 尚未註冊過
    User.findOne({ where: { email: email } })
      .then(user => {
        if (user) {
          messages.push('此 Email 已註冊過')
          return res.render('signup', { name, email, password, passwordConfirm, messages })
          // req.flash('error_messages', '此 Email 已註冊過')
          // return res.render('signup', { name, email, password, passwordConfirm })
        }

        // 建立 User
        User.create({
          email: email,
          name: name,
          account: email.split('@')[0],
          password: bcrypt.hashSync(password, bcrypt.genSaltSync(10).null),
          role: 'user'
        })
          .then(user => {
            messages.push('註冊成功')
            return res.render('signin', { messages })
            // req.flash('success_messages', '註冊成功')
            // return res.redirect('/signin')
          })
      })
  },

  signinPage: (req, res) => {
    return res.render('signin')
  },

  signin: (req, res) => {
    return res.redirect('/')
  },

  signout: (req, res) => {
    const messages = []
    messages.push('成功登出')
    req.logout()
    res.render('signin', { messages })
  },

  adminSigninPage: (req, res) => {
    return res.render('admin/signin')
  },

  adminSignin: (req, res) => {
    return res.redirect('/admin/tweets')
  },

  putUserApi: (req, res) => {
    User.findByPk(req.user.id)
      .then(user => {
        user.update({
          name: req.body.name,
          introduction: req.body.introduction
        })
          .then(user => {
            return res.redirect(`/users/${req.user.id}/tweets`)
          })
      })
  },

  getTweets: (req, res) => {
    const userId = req.user.id
    const paramsId = req.params.id

    // User的 追蹤對象的 Id 的資料
    User.findByPk(userId, { include: [{ model: User, as: 'Followings' }] })
      .then(user => {
        const userFollowingsId = user.dataValues.Followings.map(d => d.dataValues.id)

        // 畫面中間 Tweets 的資料
        Tweet.findAll({ where: { UserId: paramsId }, include: [User, Reply, { model: Like, include: User }] })
          .then(tweets => {
            const data = tweets.map(d => ({
              ...d.dataValues,
              isUserliked: d.Likes.map(d => d.User.dataValues.id).includes(userId),
              replyNum: d.Replies.length,
              likeUserNum: d.Likes.length
            }))
            // 畫面中間上方 查看的paramsUser 的資料
            User.findByPk(paramsId)
              .then(paramsUser => {
                paramsUser = paramsUser.dataValues
                paramsUser.isFollowedByUser = userFollowingsId.includes(paramsUser.id)

                // 畫面右側 Popular 的資料 
                User.findAll({ where: { id: { [Op.not]: req.user.id } }, limit: 10, include: [{ model: User, as: 'Followers' }, { model: User, as: 'Followings' }] })
                  .then(users => {
                    const popularUsers = users.map(d => ({
                      ...d.dataValues,
                      isFollowedByUser: d.Followers.map(d => d.dataValues.id).includes(userId)
                    }))
                    return res.render('userTweets', { tweets: data, paramsId: paramsId, paramsUser: paramsUser, popularUsers: popularUsers })
                  })
              })
          })
      })
  },

  getReplies: (req, res) => {
    const userId = req.user.id
    const paramsId = req.params.id

    // User的 追蹤對象的 Id 的資料
    User.findByPk(userId, { include: [{ model: User, as: 'Followings' }] })
      .then(user => {
        const userFollowingsId = user.dataValues.Followings.map(d => d.dataValues.id)

        // 畫面中間 Replies 的資料
        Reply.findAll({ where: { UserId: paramsId }, include: [User, { model: Tweet, include: User }] })
          .then(replies => {
            const data = replies.map(d => ({
              ...d.dataValues,
              User: d.User.dataValues,
              Tweet: d.Tweet.dataValues,
              TweetUser: d.Tweet.User.dataValues
            }))
            // 畫面中間上方 查看的paramsUser 的資料
            User.findByPk(paramsId)
              .then(paramsUser => {
                paramsUser = paramsUser.dataValues
                paramsUser.isFollowedByUser = userFollowingsId.includes(paramsUser.id)

                // 畫面右側 Popular 的資料 
                User.findAll({ where: { id: { [Op.not]: req.user.id } }, limit: 10, include: [{ model: User, as: 'Followers' }, { model: User, as: 'Followings' }] })
                  .then(users => {
                    const popularUsers = users.map(d => ({
                      ...d.dataValues,
                      isFollowedByUser: d.Followers.map(d => d.dataValues.id).includes(userId)
                    }))
                    return res.render('userReplies', { replies: data, paramsId: paramsId, paramsUser: paramsUser, popularUsers: popularUsers })
                  })
              })
          })
      })
  },

  getFollowers: (req, res) => {
    const userId = req.user.id
    const paramsId = req.params.id

    // User的 追蹤對象的 Id 的資料
    User.findByPk(userId, { include: [{ model: User, as: 'Followings' }] })
      .then(user => {
        const userFollowingsId = user.dataValues.Followings.map(d => d.dataValues.id)

        // 畫面中間 Lollowers 的資料
        User.findByPk(paramsId, { include: [Tweet, { model: User, as: 'Followers' }, { model: User, as: 'Followings' }] })
          .then(paramsUser => {
            paramsUser = {
              ...paramsUser.dataValues,
              FollowingsId: paramsUser.Followings.map(d => d.dataValues.id),
              Followers: paramsUser.Followers,
              tweetNum: paramsUser.Tweets.length
            }
            paramsUser.Followers.forEach(d => {
              d.isFollowedByUser = userFollowingsId.includes(d.dataValues.id)
            })

            // 畫面右側 Popular 的資料
            User.findAll({ where: { id: { [Op.not]: req.user.id } }, limit: 10, include: [{ model: User, as: 'Followers' }, { model: User, as: 'Followings' }] })
              .then(users => {
                const popularUsers = users.map(d => ({
                  ...d.dataValues,
                  isFollowedByUser: userFollowingsId.includes(d.dataValues.id)
                }))
                return res.render('userFollowers', { paramsUser: paramsUser, popularUsers: popularUsers })
              })
          })
      })
  },

  getFollowings: (req, res) => {
    const userId = req.user.id
    const paramsId = req.params.id

    // User的 追蹤對象的 Id 的資料
    User.findByPk(userId, { include: [{ model: User, as: 'Followings' }] })
      .then(user => {
        const userFollowingsId = user.dataValues.Followings.map(d => d.dataValues.id)

        // 畫面中間 Lollowings 的資料
        User.findByPk(paramsId, { include: [Tweet, { model: User, as: 'Followings' }, { model: User, as: 'Followers' }] })
          .then(paramsUser => {
            paramsUser = {
              ...paramsUser.dataValues,
              FollowingsId: paramsUser.Followings.map(d => d.dataValues.id),
              Followings: paramsUser.Followings,
              tweetNum: paramsUser.Tweets.length
            }
            paramsUser.Followings.forEach(d => {
              d.isFollowedByUser = userFollowingsId.includes(d.dataValues.id)
            })

            // 畫面右側 Popular 的資料
            User.findAll({ where: { id: { [Op.not]: userId } }, limit: 10, include: [{ model: User, as: 'Followers' }] })
              .then(users => {
                const popularUsers = users.map(d => ({
                  ...d.dataValues,
                  isFollowedByUser: userFollowingsId.includes(d.dataValues.id)
                }))
                return res.render('userFollowings', { paramsUser: paramsUser, popularUsers: popularUsers })
              })
          })
      })
  },

  getLikes: (req, res) => {
    const userId = req.user.id
    const paramsId = req.params.id
    // User的 追蹤對象的 Id 的資料
    User.findByPk(userId, { include: [{ model: User, as: 'Followings' }] })
      .then(user => {
        const userFollowingsId = user.dataValues.Followings.map(d => d.dataValues.id)

        // 畫面中間 Likes 的資料
        Like.findAll({ where: { UserId: paramsId }, include: [User, { model: Tweet, include: [User, Reply, Like] }] })
          .then(likes => {
            const data = likes.map(d => ({
              ...d.dataValues,
              isUserliked: d.UserId.toString().includes(userId.toString()),
              replyNum: d.Tweet.Replies.length,
              likeUserNum: d.Tweet.Likes.length
            }))
            // 畫面中間上方 查看的paramsUser 的資料
            User.findByPk(paramsId)
              .then(paramsUser => {
                paramsUser = paramsUser.dataValues
                paramsUser.isFollowedByUser = userFollowingsId.includes(paramsUser.id)

                // 畫面右側 Popular 的資料 
                User.findAll({ where: { id: { [Op.not]: req.user.id } }, limit: 10, include: [{ model: User, as: 'Followers' }, { model: User, as: 'Followings' }] })
                  .then(users => {
                    const popularUsers = users.map(d => ({
                      ...d.dataValues,
                      isFollowedByUser: d.Followers.map(d => d.dataValues.id).includes(userId)
                    }))
                    return res.render('userLikes', { likes: data, paramsId: paramsId, paramsUser: paramsUser, popularUsers: popularUsers })
                  })
              })
          })
      })
  }
}

module.exports = userController
