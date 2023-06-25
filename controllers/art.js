// Import Dependencies
const express = require('express')
// const Example = require('../models/example')
const user = require('./user')
const Gallery = require('../models/gallery')
const Art = require('../models/favorite')
const { default: axios } = require('axios')

// Create router
const router = express.Router()

// Router Middleware


// Routes

// index ALL
router.get('/', async (req,  res)=>{
	let page
	let search
	if(req.query.page && req.query.page !== 1){
		page = req.query.page
	}else{
		page = 1
	}
	if(req.query.q && req.query.q !== undefined){
		search = req.query.q
	}else{
		search = ''
	}
	const artInfo = await axios(`${process.env.API_URL}/search?fields=id,title,artist_display,image_id,alt_text,medium_display,artist_titles&page=${page}&limit=50&q=${search}`)
	const artData = artInfo.data.data
	const artConfig = artInfo.data.config.iiif_url+'/'
	const artPage = artInfo.data.pagination
	console.log(search)
	res.render('arts/index', {artData, artConfig, page, search, ...req.session})
})

// show route
router.get('/:id', async (req, res) => {
	const artId = req.params.id
	const artInfo = await axios(`${process.env.API_URL}/${artId}?fields=id,title,artist_display,image_id,alt_text,medium_display,artist_titles`)
	const artData = artInfo.data.data
	const artConfig = artInfo.data.config.iiif_url+'/'
	res.render('arts/show', { artData, artConfig, ...req.session})
})

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


router.get('/addToGallery/:artId', async (req, res) => {
	const artId = req.params.artId
	const artInfo = await axios(`${process.env.API_URL}/${artId}?fields=id,title,artist_display,image_id,alt_text,medium_display,artist_titles`)
	const artData = artInfo.data
	const { username, loggedIn, userId } = req.session
	Gallery.find({ owner: userId })
	.populate('owner')
	.populate('owner.username', '-password')
		.then(galleries => {
		res.render('arts/addToGallery', { username, artData, artId, loggedIn, userId, galleries, artId })
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
	})

// // index that shows only the user's arts
// router.get('/mine', (req, res) => {
// 	// destructure user info from req.session
//     const { username, userId, loggedIn } = req.session
// 	Art.find()
// 	.then(arts => {
// 		res.render('arts/index', { arts, username, loggedIn })
// 	})
// 		.catch(error => {
// 			res.redirect(`/error?error=${error}`)
// 		})
// 	})
	

	

// Export the Router
module.exports = router
