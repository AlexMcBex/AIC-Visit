////////////////////////////////////////////
// Import Dependencies
////////////////////////////////////////////
const express = require('express')
const User = require('../models/user')
const Gallery = require('../models/gallery')
const Fav = require('../models/favorite')
const bcrypt = require('bcryptjs')

////////////////////////////////////////////
// Create router
////////////////////////////////////////////
const router = express.Router()


// Routes
// user route -> shows user collections
router.get('/', (req, res) => {
	const { username, userId, loggedIn } = req.session
	Gallery.find({ owner: userId })
		.then(galleries => {
			Fav.find({ owner: userId })
			.then(favs=>{
				res.render('user/index', {username, loggedIn })
			})
			.catch(error => {
				res.redirect(`/error?error=${error}`)
			})
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// Export the Router
module.exports = router
