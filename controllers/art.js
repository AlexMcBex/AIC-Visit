// Import Dependencies
const express = require('express')
// const Example = require('../models/example')
const user = require('./user')
const { default: axios } = require('axios')

// Create router
const router = express.Router()

// Router Middleware


// Routes

// index ALL
router.get('/', async (req,  res)=>{
	let page
	if(req.query.page && req.query.page !== 1){
		page = req.query.page
	}else{
		page = 1
	}
	const search = req.query.q
	const artInfo = await axios(`${process.env.API_URL}/search?fields=id,title,artist_display,image_id,alt_text&page=${page}&limit=50&q=${search}`)
	const artData = artInfo.data.data
	const artConfig = artInfo.data.config.iiif_url+'/'
	const artPage = artInfo.data.pagination
	console.log("Rembrandt Harmensz. van Rijn Dutch, 1606–".length)
	res.render('arts/index', {artData, artConfig, page, search, ...req.session})
})

// show route
router.get('/:id', async (req, res) => {
	const artId = req.params.id
	const artInfo = await axios(`${process.env.API_URL}/${artId}`)
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
// index that shows only the user's arts
router.get('/mine', (req, res) => {
	// destructure user info from req.session
    const { username, userId, loggedIn } = req.session
	Example.find({ owner: userId })
	.then(arts => {
		res.render('arts/index', { arts, username, loggedIn })
	})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
	})
	
	// new route -> GET route that renders our page with the form
	router.get('/new', (req, res) => {
	const { username, userId, loggedIn } = req.session
	res.render('arts/new', { username, loggedIn })
})

// create -> POST route that actually calls the db and makes a new document
router.post('/', (req, res) => {
	req.body.ready = req.body.ready === 'on' ? true : false

	req.body.owner = req.session.userId
	Example.create(req.body)
		.then(example => {
			console.log('this was returned from create', example)
			res.redirect('/arts')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// edit route -> GET that takes us to the edit form view
router.get('/:id/edit', (req, res) => {
	// we need to get the id
	const artId = req.params.id
	Example.findById(exampleId)
		.then(example => {
			res.render('arts/edit', { art })
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// update route
router.put('/:id', (req, res) => {
	const artId = req.params.id
	req.body.ready = req.body.ready === 'on' ? true : false

	Example.findByIdAndUpdate(artId, req.body, { new: true })
		.then(art => {
			res.redirect(`/arts/${example.id}`)
		})
		.catch((error) => {
			res.redirect(`/error?error=${error}`)
		})
})

// delete route
router.delete('/:id', (req, res) => {
	const exampleId = req.params.id
	Example.findByIdAndRemove(exampleId)
		.then(art => {
			res.redirect('/arts')
		})
		.catch(error => {
			res.redirect(`/error?error=${error}`)
		})
})

// Export the Router
module.exports = router
