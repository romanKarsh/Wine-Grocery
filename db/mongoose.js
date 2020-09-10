/* Module holds connection to mongo server through the Mongoose API.
   Will access the connection in our express server. */
const mongoose = require('mongoose');

/* Connnect to database */
// Get the URI of the local database, or the one specified on deployment.
const mongoURI = process.env.MONGODB_URI || "mongodb://localhost:27017/StoreAPI";

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true});

module.exports = { mongoose }  // Export the active connection.