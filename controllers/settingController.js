const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

const settingController = {
  settingPage: (req, res) => {
    const { account, name, email } = req.user
    return res.render('setting', { account, name, email })
  },

  setting: (req, res) => {
    const userId = req.user.id
    const { account, name, email, password, passwordConfirm } = req.body
    const messages = []

    if (password !== passwordConfirm) {
      messages.push('更新失敗，密碼輸入不一致')
      return res.render('setting', { account, name, email, messages })
    }

    User.findByPk(userId)
      .then(user => {
        if (password) {
          user.update({
            account: account,
            name: name,
            email: email,
            password: bcrypt.hashSync(password, bcrypt.genSaltSync(10).null)
          })
          .then(() => {
            messages.push('更新成功')
            return res.render('setting', { account, name, email, messages })
          })
        } else {
          user.update({
            account: account,
            name: name,
            email: email
          })
          .then(() => {
            messages.push('更新成功')
            return res.render('setting', { account, name, email, messages })
          })
        }
      })
  }
}

module.exports = settingController
