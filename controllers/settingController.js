const db = require('../models')
const User = db.User

const settingController = {
  settingPage: (req, res) => {
    return res.render('setting')
  },
}

module.exports = settingController
