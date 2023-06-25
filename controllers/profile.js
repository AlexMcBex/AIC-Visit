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

// Authorization middleware
// If you have some resources that should be accessible to everyone regardless of loggedIn status, this middleware can be moved, commented out, or deleted. 
router.use((req, res, next) => {
	// checking the loggedIn boolean of our session
	if (req.session.loggedIn) {
		// if they're logged in, go to the next thing(thats the controller)
		next()
	} else {
		// if they're not logged in, send them to the login page
		res.redirect('/auth/login')
	}
})
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////

// Routes
// user route -> shows user collections
router.get('/', (req, res) => {
	const { username, userId, loggedIn } = req.session
	let userGalleries
	Gallery.find({ owner: userId })
		.then(galleries => {
			userGalleries = galleries
			Fav.find({ owner: userId })
			.then(favs=>{
				res.render('user/index', {username, loggedIn, userGalleries, favs })
			})
			.catch(error => {
				res.redirect(`/error?error=${error}`)
			})
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

router.get('/gallery/:id', (req, res)=>{
	const id = req.params.id
	Gallery.findById(id)
	.populate('title')
	.populate('arts')
	.populate('owner')
	.populate('owner.username', '-password')

	.then(gallery =>{
	const { username, userId, loggedIn } = req.session
	res.render('user/galleryShow', {...req.session, gallery})
	})
	.catch(error => {
		res.redirect(`/error?error=${error}`)
	})
})

// Export the Router
module.exports = router
