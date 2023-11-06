// const envy = require('envy')
// const env = envy()

require("dotenv").config();

const mongodbpath = process.env.mongodbpath;

const mongoose = require("mongoose");

// mongoose.set("useNewUrlParser", true);
// mongoose.set("useFindAndModify", false);
// mongoose.set("useCreateIndex", true);
// mongoose.set("useUnifiedTopology", true);

// const mongodbpath = "mongodb://localhost:27017/blogWebsiteDB";

const startMongoDbServer = mongoose.connect(mongodbpath);

module.exports = startMongoDbServer;
