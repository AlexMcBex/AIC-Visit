////////////////////////////////////////////
// Import Dependencies
////////////////////////////////////////////
const express = require('express')
const User = require('../models/user')
const Gallery = require('../models/gallery')
const Fav = require('../models/favorite')
const bcrypt = require('bcryptjs')
const { default: axios } = require('axios')

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
	console.log(gallery.arts)
	res.render('user/galleryShow', {...req.session, gallery})
	})
	.catch(error => {
		res.redirect(`/error?error=${error}`)
	})
})

router.get('/gallery/:galleryId/addArt/:artId', async(req,res)=>{
	const galleryId = req.params.galleryId
	const artId = req.params.artId
	const artInfo = await axios(`${process.env.API_URL}/${artId}?fields=id,title,artist_display,image_id,alt_text,medium_display,artist_titles`)
	const art = artInfo.data.data
	req.body = {
		apiId : artId,
		title: art.title,
		artist: art.artist_display,
		imageSrc: art.image_id
	}
	console.log(req.body)
	Fav.create(req.body)
	.then(fav=>{
		Gallery.findById(galleryId)
		.then(gallery=>{
			gallery.arts.push(fav)
			return gallery.save()
		})
		.then(gallery=>{
			res.redirect(`/user/gallery/${gallery.id}`)
		})
		.catch(err =>{
			res.redirect(`/error?error=${err}`)
			})
	})
	.catch(err =>{
		res.redirect(`/error?error=${err}`)
		})

} )

// Export the Router
module.exports = router
