import mongoose from 'mongoose';


const botinfoSchema = mongoose.Schema(
	{ id: {
		type: String,
		require: true
	},
	name:{
		type: String
	},
	obtenerTweets: {
		type: Boolean
	},
	usuariosPublicaciones: {
		type: Boolean
	},

	whiteList: {
		type: Array
	},
	blackList: {
		type: Array
	},
	blackListGroup: {
		type: Array
	}
	});

	export default mongoose.model('botinfo', botinfoSchema);
