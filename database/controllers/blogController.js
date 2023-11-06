const Blog = require("../models/blogModel");
const User = require("../models/userModel");

module.exports = {
	createBlog: function (req, res, next) {
		// var title = req.body.title;
		// var authorFirstName = req.body.firstname;
		// var authorLastName = req.body.lastname;
		// var authorEmail = req.body.email;
		// var date = req.body.date; // yyyy-mm-dd format

		const title = req.body.title;
		const content = req.body.content;
		const authorFirstName = req.session.userData.name;
		const authorLastName = req.session.userData.lastname;
		const authorEmail = req.session.userData.email;
		// const date = req.body.date; // yyyy-mm-dd format

		// console.log(req.session.userData.name);
		const newBlog = new Blog({
			title: title,
			content: content,
			"author.name": authorFirstName,
			"author.lastname": authorLastName,
			"author.email": authorEmail,
			// date: date,
		});

		newBlog.save(function (err, blog) {
			if (err) {
				res.status(400).send({
					code: 400,
					status: "Bad Request",
					message: "Input validation error: " + err.message,
				});
			} else {
				const blogId = blog._id;

				try {
					User.updateOne(
						{ email: authorEmail },
						{ $push: { "ref.blogs": [{ _id: blogId }] } },
						function (err, result) {
							const requestedTitle = title;

							res.redirect("/blogs/" + requestedTitle);
						}
					);
				} catch (err) {
					try {
						Blog.deleteOne({ _id: blogId }, function (error, result) {
							res.status(200).send({
								code: 200,
								status: "Ok",
								message:
									"Update User blog reference failed (err). New Blog could be deleted again",
								message_err: err.message,
							});
						});
					} catch (error) {
						res.status(500).send({
							code: 500,
							status: "Internal Server Error",
							message_text:
								"Update User blog reference failed (err) and new Blog deletion failed (error)",
							message_err: err.message,
							message_error: error.message,
						});
					}
				}
			}
		});
	},

	removeBlog: function (req, res, next) {
		const title = req.body.title;
		try {
			Blog.findOne({ title: title }, function (error, blog) {
				if (!blog) {
					res.status(400).send({
						code: 400,
						status: "Bad Request",
						message: "No Blog with this Title. Blog Removal not possible",
					});
				} else {
					const blogId = blog._id;
					const authorEmail = blog.author.email;

					try {
						Blog.deleteOne({ _id: blogId }, function (error, result) {
							try {
								User.updateOne(
									{ email: authorEmail },
									{ $pull: { "ref.blogs": { _id: blog._id } } },
									function (err, result) {
										if (result.n == 0) {
											res.status(200).send({
												code: 200,
												status: "Ok",
												message:
													"Blog removed. No User found to update User blog reference",
											});
										} else {
											res.status(200).send({
												code: 200,
												status: "Ok",
												message:
													"Blog removed. User blog reference successfully updated",
											});
										}
									}
								);
							} catch (err) {
								blog.save(function (error, withdrawn_blog) {
									if (error) {
										res.status(500).send({
											code: 500,
											status: "Internal Server Error",
											message_text:
												"Blog removed. User blog reference update failed (err). Restore blog failed (error)",
											message_err: err.message,
											message_error: error.message,
										});
									} else {
										res.status(200).send({
											code: 200,
											status: "Ok",
											message:
												"Blog restored successfully. User blog reference update failed (err): " +
												err.message,
										});
									}
								});
							}
						});
					} catch (error) {
						next(error);
					}
				}
			});
		} catch (error) {
			next(error);
		}
	},

	returnAllBlogs: function (req, res, next) {
		try {
			Blog.find({}, function (error, blogs) {
				// if (blogs.length == 0) {
				// 	res
				// 		.status(200)
				// 		.send({ code: 200, status: "Ok", message: "No blogs found" });
				// } else {
					var allBlogs = [];

					for (i = 0; i < blogs.length; i++) {
						var dataset = {
							title: blogs[i].title,
							author: blogs[i].author,
							content: blogs[i].content,
						};

						allBlogs.push(dataset);
					}

					if (req.session.userData) {
						res.render("dashboard", {
							blogs: allBlogs,
						});
					} else {
						res.render("home", {
							blogs: allBlogs,
						});
					}
				// }
			});
		} catch (error) {
			next(error);
		}
		// } else {
		// 	next();
		// }
	},

	returnBlog: function (req, res, next) {
		const requestedTitle = req.params.blogTitle;

		Blog.findOne({ title: requestedTitle }).then((post) => {
			res.render("blog", {
				title: post.title,
				content: post.content,
				author: post.author.name + " " + post.author.lastname,
				email: post.author.email,
			});
		});
	},

	returnYearBlogs: function (req, res, next) {
		if (url == "/blogs" + "/" + year) {
			var gte = year + "-" + "01-01";
			var lte = year + "-" + "12-31";
			var timeQuery = { date: { $gte: gte, $lte: lte } };

			try {
				Blog.find(timeQuery, function (error, blogs) {
					if (blogs.length == 0) {
						res.status(200).send({
							code: 200,
							status: "Ok",
							message: "No Blogs found for this year",
							year: year,
						});
					} else {
						var yearBlogs = [];
						for (i = 0; i < blogs.length; i++) {
							var dataset = {
								title: blogs[i].title,
								author: blogs[i].author,
								date: blogs[i].date,
							};
							yearBlogs.push(dataset);
						}
						res.status(200).send({
							code: 200,
							status: "Ok",
							message: "Blogs found for this year",
							year: year,
							data: yearBlogs,
						});
					}
				});
			} catch (error) {
				next(error);
			}
		} else {
			next();
		}
	},

	returnMonthBlogs: function (req, res, next) {
		if (url == "/blogs" + "/" + year + "/" + month) {
			var gte = year + "-" + month + "-" + "01";
			var lte = year + "-" + month + "-" + "31";
			var timeQuery = { date: { $gte: gte, $lte: lte } };

			try {
				Blog.find(timeQuery, function (error, blogs) {
					if (blogs.length == 0) {
						res.status(200).send({
							code: 200,
							status: "Ok",
							message: "No Blogs found for this year and month",
							year: year,
							month: month,
						});
					} else {
						var yearMonthBlogs = [];
						for (i = 0; i < blogs.length; i++) {
							var dataset = {
								title: blogs[i].title,
								author: blogs[i].author,
								date: blogs[i].date,
							};
							yearMonthBlogs.push(dataset);
						}
						res.status(200).send({
							code: 200,
							status: "Ok",
							message: "Blogs found for this year and month",
							year: year,
							month: month,
							data: yearMonthBlogs,
						});
					}
				});
			} catch (error) {
				next(error);
			}
		} else {
			next();
		}
	},

	returnDateBlogs: function (req, res, next) {
		var gte = year + "-" + month + "-" + day;
		var lte = year + "-" + month + "-" + day;
		var timeQuery = { date: { $gte: gte, $lte: lte } };

		try {
			Blog.find(timeQuery, function (error, blogs) {
				if (blogs.length == 0) {
					res.status(200).send({
						code: 200,
						status: "Ok",
						message: "No Blogs found for this date",
						year: year,
						month: month,
						day: day,
					});
				} else {
					var dateBlogs = [];
					for (i = 0; i < blogs.length; i++) {
						var dataset = {
							title: blogs[i].title,
							author: blogs[i].author,
							date: blogs[i].date,
						};
						dateBlogs.push(dataset);
					}
					res.status(200).send({
						code: 200,
						status: "Ok",
						message: "Blogs found for this date",
						year: year,
						month: month,
						day: day,
						data: dateBlogs,
					});
				}
			});
		} catch (error) {
			next(error);
		}
	},
};
