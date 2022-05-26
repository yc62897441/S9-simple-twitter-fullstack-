const db = require('../models')
const Followship = db.Followship

const followshipController = {
  follow: (req, res) => {
    const userId = req.user.id
    const paramsId = req.params.id
    Followship.create({
      followerId: userId,
      followingId: paramsId
    })
      .then(followship => {
        return res.redirect('back')
      })
  },

  unfollow: (req, res) => {
    const userId = req.user.id
    const paramsId = req.params.id
    Followship.findOne({ where: { followerId: userId, followingId: paramsId } })
      .then(followship => {
        followship.destroy()
          .then(() => {
            return res.redirect('back')
          })
      })
  }
}

module.exports = followshipController
