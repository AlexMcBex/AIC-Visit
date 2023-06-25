// import dependencies
const mongoose = require('./connection')

// import user model for populate
const User = require('./user')

// destructure the schema and model constructors from mongoose
const { Schema, model } = mongoose

const favSchema = new Schema(
	{
        apiId: { type: Number, required: true },
		title: {type: String, required: true},
		artist: {type: String, required: true},
		imageSrc: {type: String, required: true},
		owner: {
			type: Schema.Types.ObjectID,
			ref: 'User',
		}
	},
	{ timestamps: true }
)

const Fav = model('Fav', favSchema)

/////////////////////////////////
// Export our Model
/////////////////////////////////
module.exports = Fav
