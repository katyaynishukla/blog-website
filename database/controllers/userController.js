const Blog = require("../models/blogModel");
const User = require("../models/userModel");

module.exports = {
	createUser: function (req, res, next) {
		const name = req.body.name;
		const lastname = req.body.lastname;
		const email = req.body.email;
		const password = req.body.password;

		const newUser = new User({
			name: name,
			lastname: lastname,
			email: email,
			password: password,
		});

		try {
			User.findOne({ email: email }, function (error, user) {
				if (user) {
					res.status(400).send({
						code: 400,
						status: "Bad Request",
						message: "User already exist. Create User not possible",
					});
				} else {
					newUser.save(function (err, user) {
						if (err) {
							res.status(400).send({
								code: 400,
								status: "Bad Request",
								message: err.message,
							});
						} else {
							var userData = {
								userId: user._id,
								name: user.name,
								lastname: user.lastname,
								email: user.email,
							};

							req.session.userData = userData;

							res.redirect("/dashboard");
							// res.status(200).send({
							// 	code: 200,
							// 	status: "Ok",
							// 	message: "User successfully created",
							// 	data: user,
							// });
						}
					});
				}
			});
		} catch (error) {
			next(error);
		}
	},

	loginUser: function (req, res) {
		User.findOne({ email: req.body.email }, function (error, user) {
			if (!user) {
				res
					.status(400)
					.send({
						code: 400,
						status: "Bad Request",
						message: "No User found with this email",
					});
			} else {
				if (req.body.password === user.password) {
					// req.session.userId = user._id

					var userData = {
						userId: user._id,
						name: user.name,
						lastname: user.lastname,
						email: user.email,
					};

					req.session.userData = userData;

					res.redirect("/dashboard");
				} else {
					res
						.status(400)
						.send({
							code: 400,
							status: "Bad Request",
							message: "Wrong User password",
						});
				}
			}
		});
	},

	updateUserEmail: function (req, res, next) {
		const email = req.body.email;
		const updateEmail = req.body.updateEmail;

		try {
			User.findOne({ email: email }, function (error, user) {
				if (!user) {
					res.status(400).send({
						code: 400,
						status: "Bad Request",
						message: "User not found. Update User not possible",
					});
				} else {
					user.email = updateEmail;
					user.save(function (err, up_user) {
						if (err) {
							res.status(400).send({
								code: 400,
								status: "Bad Request",
								message: err.message,
							});
						} else {
							try {
								Blog.updateMany(
									{ "author.email": email },
									{ "author.email": updateEmail },
									function (err, result) {
										if (result.n == 0) {
											res.status(200).send({
												code: 200,
												status: "Ok",
												message:
													"User email update successful. No Blog Found to update author email",
												data: up_user,
											});
										} else {
											res.status(200).send({
												code: 200,
												status: "Ok",
												message:
													"User email and Blogs author email update successful",
												data: up_user,
											});
										}
									}
								);
							} catch (err) {
								user.email = email;
								user.save(function (error, restored_user) {
									if (error) {
										res.status(500).send({
											code: 500,
											status: "Internal Server Error",
											message_text:
												"Blog author email update failed (err) and user could not be restored (error)",
											message_err: err.message,
											message_error: error.message,
										});
									} else {
										res.status(200).send({
											code: 200,
											status: "Ok",
											message:
												"User restored because Blog author email update failed",
											message_err: err.message,
											data: restored_user,
										});
									}
								});
							}
						}
					});
				}
			});
		} catch (error) {
			next(error);
		}
	},

	removeUser: function (req, res, next) {
		const email = req.body.email;
		try {
			User.deleteOne({ email: email }, function (error, result) {
				if (result.n == 0) {
					res.status(400).send({
						code: 400,
						status: "Bad Request",
						message: "No User with this Email. Remove User not possible",
					});
				} else {
					res.status(200).send({
						code: 200,
						status: "Ok",
						message: "User removed successfully",
					});
				}
			});
		} catch (error) {
			next(error);
		}
	},
};
