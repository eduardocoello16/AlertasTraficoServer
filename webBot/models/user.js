const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
	{
		id: {
			type: String,
			required: true
		},
		username: {
			type: String,
			require: false
		},
		first_name: {
			type: String,
			require: false
		},
		last_name: {
			type: String,
			require: false
		},
		type_user: {
			type: String,
			enum: ['admin','moder', 'user'],
			default: 'user'
		},
		status_user: {
			type: String,
			enum: ['pending','deny','active', 'banned'],
			default: 'pending'
		},
		penalization: {
			type: Number,
			default: 0
		},
		Date_creation: {
			type: Date,
			default: Date.now
		},
		Date_request: {
			type: Date,
			default: Date.now
		},
		Date_ban:{
			type: Date
		},
		banned_until: {
			type: Date
		}
	}
);

module.exports = mongoose.model('user', userSchema);