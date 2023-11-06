var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var userSchema = new Schema({
	_id: {
		type: Schema.ObjectId,
		auto: true,
	},

	_created: {
		type: Date,
		default: Date.now(),
	},

	name: {
		type: String,
		required: true,
		validate: function (name) {
			return /^[a-zA-Z0-9üÜäÄöÖ.’-]+$/.test(name);
		},
	},

	lastname: {
		type: String,
		required: true,
		validate: function (lastname) {
			return /^[a-zA-Z0-9üÜäÄöÖ.’-]+$/.test(lastname);
		},
	},

	email: {
		type: String,
		required: true,
		validate: function (email) {
			return /^[a-zA-Z0-9.!#$%&’*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9-]{2,10}$/.test(
				email
			);
		},
	},

	password: {
		type: String,
		required: true,
	},

	ref: {
		blogs: [
			{
				_id: {
					type: String,
				},
			},
		],
	},
});

var User = mongoose.model("col_user", userSchema);

module.exports = User;
