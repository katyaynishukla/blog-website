var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var blogSchema = new Schema({
	_id: {
		type: Schema.ObjectId,
		auto: true,
	},

	_created: {
		type: Date,
		default: Date.now(),
	},

	title: {
		type: String,
		required: true,
		validate: function (title) {
			return /^[a-zA-Z0-9üÜäÄöÖ;,:._+?=(\-)&%$§"!\ ]{5,150}$/.test(title);
		},
	},

	content: {
		type: String,
		required: true,
	},

	author: {
		name: {
			type: String,
			// required: true,
			validate: function (firstname) {
				return /^[a-zA-Z0-9üÜäÄöÖ.’-]+$/.test(firstname);
			},
		},
		lastname: {
			type: String,
			// required: true,
			validate: function (lastname) {
				return /^[a-zA-Z0-9üÜäÄöÖ.’-]+$/.test(lastname);
			},
		},
		email: {
			type: String,
			// required: true,
			validate: function (email) {
				return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9-]{2,10}$/.test(
					email
				);
			},
		},
	},

	// date: {
	// 	type: String,
	// 	required: true,
	// 	validate: function (date) {
	// 		return /^([0-9][0-9][0-9][0-9])-([0][1-9]|[1][0-2])-([0][1-9]|[1][0-9]|[2][0-9]|[3][0-1])$/.test(
	// 			date
	// 		);
	// 	}, // yyyy-mm-dd format
	// },
});

var Blog = mongoose.model("col_blog", blogSchema);

module.exports = Blog;
