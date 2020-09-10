/* Store mongoose model */
const mongoose = require('mongoose')

const Store = mongoose.model('Store', {
	name: {
		type: String,
		required: true,
		minlegth: 2,
		trim: true
	},
	address: {
		type: String,
		required: true,
		minlegth: 2,
		trim: true
	},
	cityTown: {
		type: String,
		required: true,
		minlegth: 2,
		trim: true
	},
	postalCode: {
		type: String,
		required: true,
    minlegth: 6,
		trim: true
	},
	lat: {
		type: Number,
	},
	lng: {
		type: Number
	},
	openHours: {
		type: Number
  },
  closeHours: {
		type: Number
	}
})

module.exports = { Store }