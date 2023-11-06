require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const session = require("express-session");
const connectMdbSession = require("connect-mongodb-session");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

const port = process.env.port;
const mongodbpath = process.env.mongodbpath;
const sessionsecret = process.env.sessionsecret;
const sessioncookiename = process.env.sessioncookiename;

const startMongoDbServer = require("./database/db");
startMongoDbServer;

/////

const MongoDBStore = connectMdbSession(session);

const store = new MongoDBStore({
	uri: mongodbpath,
	collection: "col_sessions",
});

store.on("error", function (error) {
	console.log(`error store session in session store: ${error.message}`);
});

/////

const userController = require("./database/controllers/userController");
const blogController = require("./database/controllers/blogController");

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

// use session to create session and session cookie
app.use(
	session({
		secret: sessionsecret,
		name: sessioncookiename,
		store: store,
		resave: false,
		saveUninitialized: false,
		// set cookie to 1 week maxAge
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7,
			sameSite: true,
		},
	})
);

// middleware

// middleware to redirect authenticated users to their dashboard
const redirectDashboard = (req, res, next) => {
	if (req.session.userData) {
		res.redirect("/dashboard");
	} else {
		next();
	}
};

// middleware to redirect not authenticated users to login
const redirectLogin = (req, res, next) => {
	if (!req.session.userData) {
		res.redirect("/login");
	} else {
		next();
	}
};

////

app.get("/", blogController.returnAllBlogs);

// app.get("/", (req, res) => {
// 	console.log(req.session);
// 	console.log(req.session.id);

// 	blogController.returnAllBlogs;
// 	// col_blog.find()
// 	// 	.then((blogs) => {
// 	// 		res.render("home", {
// 	// 			// startingContent: homeStartingContent,
// 	// 			blogs: blogs,
// 	// 		});
// 	// 	})
// 	// 	.catch((e) => {
// 	// 		console.log(e.message);
// 	// 	});

// 	// res.send("Hello, this is the Blog Home Page.");
// 	// res.render("home");
// 	// display all blog
// });

app.get("/login", redirectDashboard, (req, res) => {
	res.render("login");
});
app.get("/register", redirectDashboard, (req, res) => {
	res.render("register");
});

app.get("/dashboard", redirectLogin, blogController.returnAllBlogs);

app.post("/register", userController.createUser);
app.post("/login", userController.loginUser);

app.post("/updateuseremail", userController.updateUserEmail);

app.post("/removeusers", userController.removeUser);

app.get("/about", (req, res) => {
	res.send("Hello, this is the Blog About Page.");
});

app.get("/createblogs", redirectLogin, (req, res) => {
	res.render("compose");
});

app.get("/blogs/:blogTitle", blogController.returnBlog);

app.post("/createblogs", blogController.createBlog);

app.post("/removeblogs", blogController.removeBlog);

app.get(
	"/blogs/:year?/:month?/:day?",

	(req, res, next) => {
		url = req.url;
		year = req.params.year;
		month = req.params.month;
		day = req.params.day;

		next();
	},

	blogController.returnAllBlogs,
	blogController.returnYearBlogs,
	blogController.returnMonthBlogs,
	blogController.returnDateBlogs
);

app.get("/logout", redirectLogin, (req, res) => {
	req.session.destroy(function (err) {
		if (err) {
			res.send("An err occured: " + err.message);
		} else {
			res.clearCookie("express_session").redirect("/");
		}
	});
});

app.use((req, res, next) => {
	res.status(404).send({
		code: 404,
		status: "Not found",
		message: "Requested route not found",
	});
});

app.use((error, req, res, next) => {
	res.status(500).send({
		code: 500,
		status: "Internal Server Error",
		message: error.message,
	});
});

app.listen(port, function () {
	console.log("Server started on port 3000");
});
