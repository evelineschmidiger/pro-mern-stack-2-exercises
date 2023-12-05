const fs = require("fs");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");


let aboutMessage = "Issue Tracker API v1.0";


const issuesDB = [
    {
      id: 1, status: 'New', owner: 'Ravan', effort: 5,
      created: new Date('2019-01-15'), due: undefined,
      title: 'Error in console when clicking Add',
    },
    {
      id: 2, status: 'Assigned', owner: 'Eddie', effort: 14,
      created: new Date('2019-01-16'), due: new Date('2019-02-01'),
      title: 'Missing bottom border on panel',
    },
  ];



const resolvers = {
    Query: {
        about: () => aboutMessage,
        issueList,
    },
    Mutation: {
        setAboutMessage, // ES2015 Object Property Shorthand, setAboutMessage: setAboutMessage -> setAboutMessage
    },
};

function issueList() {
    return issuesDB;
}


function setAboutMessage(_, args) {
    return aboutMessage = args.message;
}

// initialising the GraphQL server
// construct an ApolloServer object defined in the apollo-server-express package
const server = new ApolloServer({
    typeDefs: fs.readFileSync("./server/schema.graphql", "utf-8"),
    resolvers,
});

// Initating application
const app = express();

// express.static(): generates a middleware-function
// responds to a request by trying to match the request url with a file in public

// Mount (anbringen, installieren) static middleware on the application:
// use() is a method of the application
// The express.static() function is a built-in middleware function in Express.
// It serves static files and is based on serve-static. 
// Parameters: The root parameter describes the root directory from which to serve static assets.
// bei request: sucht statische files in ordner "public" - public muss nicht in URL eingegeben werdenÜ
// einfach nur localhost:3000/index.html (oder nur localhost:3000)
// Achtung: Pfad ist relativ zum Verzeichnis, aus dem Sie Ihren Prozess node starten
app.use(express.static("public"));

// Install the Apollo Server as a middleware in Express
// Why does the route need to be in single-quotes???
// applyMiddleware: configuration object as argument
server.applyMiddleware({ app, path: '/graphql' });


// Start the Server
// listen() is a method of the application
// arguments: port number, optional: callback fn when server has been successfully started
app.listen(3000, function() {
    console.log("App started on port 3000");
});

