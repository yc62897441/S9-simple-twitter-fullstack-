const userController = require('../controllers/userController')
const tweetController = require('../controllers/tweetController')
const followshipController = require('../controllers/followshipController')
const settingController = require('../controllers/settingController')

const authenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.redirect('/signin')
}

const isAdminUser = (req, res, next) => {
  const userRole = req.user.role
  if (userRole === 'admin') {
    return next()
  }
  return res.redirect('/tweets')
}

const isUser = (req, res, next) => {
  const userRole = req.user.role
  if (userRole === 'user') {
    return next()
  }
  return res.redirect('/admin/tweets')
}

module.exports = (app, passport) => {
  app.get('/', authenticated, (req, res) => { return res.redirect('/tweets') })

  // admin 用戶登入 A2-developer in charge
  app.get('/admin/signin', userController.adminSigninPage)
  app.post('/admin/signin', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }), isAdminUser, userController.adminSignin)
  // admin 用戶介面 A2-developer in charge
  app.get('/admin/tweets', isAdminUser, (req, res) => { return res.render('admin/index') })
  app.delete('/admin/tweets/:id', isAdminUser, (req, res) => { })
  app.get('/admin/users', isAdminUser, (req, res) => { })

  // 一般用戶介面 A3-developer in charge
  app.get('/tweets', authenticated, isUser, tweetController.getTweets)
  app.post('/tweets', authenticated, isUser, tweetController.postTweet)
  app.get('/tweets/:id', authenticated, isUser, tweetController.getTweet)
  app.get('/tweets/:id/replies', authenticated, isUser, (req, res) => { })
  app.post('/tweets/:id/replies', authenticated, isUser, tweetController.postReply)
  app.post('/tweets/:id/like', authenticated, isUser, tweetController.likeTweet)
  app.post('/tweets/:id/unlike', authenticated, isUser, tweetController.unlikeTweet)

  // 一般用戶使用者資訊介面 A3-developer in charge
  app.get('/users/:id/tweets', authenticated, isUser, userController.getTweets)
  app.get('/users/:id/replies', authenticated, isUser, userController.getReplies)
  app.get('/users/:id/followings', authenticated, isUser, (req, res) => { })
  app.get('/users/:id/followers', authenticated, isUser, (req, res) => { })
  app.get('/users/:id/likes', authenticated, isUser, userController.getLikes)

  // 使用者資訊介面修改 in charge 未定
  app.get('/api/users/:id', authenticated, isUser, (req, res) => { })
  app.put('/api/users/:id', authenticated, isUser, userController.putUserApi)

  // 追蹤功能 in charge 未定
  app.post('/followships/:id', authenticated, isUser, followshipController.follow)
  app.delete('/followships/:id', authenticated, isUser, followshipController.unfollow)

  // 設定/更改個人資料
  app.get('/setting', authenticated, isUser, settingController.settingPage)
  app.put('/setting', authenticated, isUser, settingController.setting)

  // 註冊、登出、一般用戶登入 A2-developer in charge
  app.get('/signin', userController.signinPage)
  app.post('/signin', passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }), userController.signin)
  app.get('/signup', userController.signupPage)
  app.post('/signup', userController.signup)
  app.get('/signout', userController.signout)
}
