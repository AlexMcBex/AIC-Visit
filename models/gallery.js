// import dependencies
const mongoose = require('./connection')

// import user model for populate
const User = require('./user')

// destructure the schema and model constructors from mongoose
const { Schema, model } = mongoose

const gallerySchema = new Schema(
	{
		title: { type: String, required: true },
        amount: { type: Number, required: true },
		arts: [ {
			type: Schema.Types.ObjectID,
			ref: 'Fav'
		}],
		owner: {
			type: Schema.Types.ObjectID,
			ref: 'User',
		}
	},
	{ timestamps: true }
)

const Gallery = model('Galler', gallerySchema)

/////////////////////////////////
// Export our Model
/////////////////////////////////
module.exports = Gallery
