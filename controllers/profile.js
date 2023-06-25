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
				console.log(favs)
				const userFavs = favs
				res.render('user/index', {username, loggedIn, userGalleries, userFavs })
				console.log(userFavs)
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

// new route -> GET route that renders our page with the form
router.get('/newGallery', (req, res) => {
	const { username, userId, loggedIn } = req.session
	res.render('user/new', { username, loggedIn, userId })
})

// create -> POST route that actually calls the db and makes a new document
router.post('/', (req, res) => {

	req.body.owner = req.session.userId
	Gallery.create(req.body)
		.then(gallery => {
			console.log('this was returned from create', gallery)
			res.redirect('/user')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// edit route -> GET that takes us to the edit form view
router.get('/gallery/:id/edit', (req, res) => {
	// we need to get the id
	const galleryId = req.params.id
	Gallery.findById(galleryId)
		.then(gallery => {
			res.render('user/edit', { gallery })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// update route
router.put('/gallery/:id', (req, res) => {
	const galleryId = req.params.id

	Gallery.findByIdAndUpdate(galleryId, req.body, { new: true })
		.then(gallery => {
			res.redirect(`/user/gallery/${gallery.id}`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// delete route
router.delete('/gallery/:id', (req, res) => {
	const galleryId = req.params.id
	Gallery.findByIdAndRemove(galleryId)
		.then( gallery => {
			res.redirect('/user')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

	// delete art route
	router.delete('/gallery/:galleryId/:id', (req, res) => {
		const artId = req.params.id
		const galleryId = req.params.galleryId
		Fav.findByIdAndRemove(artId)
			.then( art => {
				res.redirect(`/user/gallery/${galleryId}`)
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
		imageSrc: art.image_id,
		owner: req.session.userId
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
