// const express = require('express')
// const router = express.Router()
const port = 3000

const userController = require('../controllers/userController')

module.exports = (app) => {
  

  // admin 用戶登入 A2-developer in charge
  app.get('/admin/signin', (req, res) => { return res.render('admin/signin') })
  app.post('/admin/signin', (req, res) => { })
  // admin 用戶介面 A2-developer in charge
  app.get('/admin/tweets', (req, res) => { return res.render('admin/index') })
  app.delete('/admin/tweets/:id', (req, res) => { })
  app.get('/admin/users', (req, res) => { })

  // 一般用戶介面 A3-developer in charge
  app.get('/tweets', (req, res) => { return res.render('index') })
  app.post('/tweets', (req, res) => { })
  app.get('/tweets/:id/replies', (req, res) => { })
  app.post('/tweets/:id/replies', (req, res) => { })
  app.post('/tweets/:id/like', (req, res) => { })
  app.post('/tweets/:id/unlike', (req, res) => { })

  // 一般用戶使用者資訊介面 A3-developer in charge
  app.get('/users/:id/tweets', (req, res) => { })
  app.get('/users/:id/followings', (req, res) => { })
  app.get('/users/:id/followers', (req, res) => { })
  app.get('/users/:id/likes', (req, res) => { })

  // 使用者資訊介面修改 in charge 未定
  app.get('/api/users/:id', (req, res) => { })
  app.post('/api/users/:id', (req, res) => { })

  // 追蹤功能 in charge 未定
  app.post('/followships', (req, res) => { })
  app.delete('/followships/:id', (req, res) => { })

  // 註冊、登出、一般用戶登入 A2-developer in charge
  app.get('/signin', (req, res) => { return res.render('signin') })
  app.post('/signin', (req, res) => { })
  app.get('/signup', userController.signupPage)
  app.post('/signup', userController.signup)
  app.get('/signout', (req, res) => { })

  app.get('/', (req, res) => { return res.render('index') })

  app.listen(port, () => console.log(`Example app listening on port ${port}!`))
}
