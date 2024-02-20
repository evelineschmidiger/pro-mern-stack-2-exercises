const fs = require("fs");
const express = require("express");
const { ApolloServer, UserInputError } = require("apollo-server-express");
// importing class for scalar type resolver
const { GraphQLScalarType } = require("graphql");
const { Kind } = require("graphql/language");
const { MongoClient } = require("mongodb");
const { log } = require("console");
const dotenv = require("dotenv");


dotenv.config({ path: "./config.env" });

const url = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

let db;


let aboutMessage = "Issue Tracker API v1.0";



///---------- GRAPH QL ----------------///

  // using GraphQLScalarType-class from graphql-package
  // Object with properties (name & description) as argument to constructor-function of GraphGLScalarType
  const GraphQLDate = new GraphQLScalarType({ 
    name: "GraphQLDate",
    description: "A Date() type in GraphQL as a scalar",
    serialize(value) {
        return value.toISOString();
    },
    // Apollo calls this method when the scalar is provided by a client as a GraphQL variable for an argument - ??"New Date" created in FE and sent as argument??
    parseValue(value) {
        const dateValue = new Date(value);
        return isNaN(dateValue) ? undefined : dateValue;
    },
    // called in normal case, field is specified in-place in query
    // When an incoming query string includes the scalar as a hard-coded argument value, that value is part of the query document's abstract syntax tree (AST).
    // Apollo Server calls the parseLiteral method to convert the value's AST representation to the scalar's back-end representation.
/*     parseLiteral(ast) {
        // if undefinded is returned: type could not be converted, error
        // asks if its a strings, converts or sends undefined back
        return (ast.kind == Kind.STRING) ? new Date(ast.value) : undefined;
    } */
    parseLiteral(ast) {
        if (ast.kind == Kind.STRING) {
            const value = new Date(ast.value);
            return isNaN(value) ? undefined : value;
        }
/*     const date = new Date(ast.value)
    return (ast.kind == Kind.STRING) && date ? date : undefined; */
    }

  });

const resolvers = {
    Query: {
        about: () => aboutMessage,
        issueList,
    },
    Mutation: {
        setAboutMessage, // ES2015 Object Property Shorthand, setAboutMessage: setAboutMessage -> setAboutMessage
        issueAdd,
    },
    GraphQLDate,
};



function setAboutMessage(_, args) {
  return aboutMessage = args.message;
}

async function issueList() {
    const issues = await db.collection('issues').find({}).toArray();
    return issues;
}


async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );
  return result.value.current;
}

function validateIssue(issue) {
    const errors = [];
    if (issue.title.length < 3) {
        errors.push('Field "title" must be at least 3 characters long.');
    }
    if (issue.status == "Assigned" && !issue.owner) {
        errors.push('Field "owner" is required when status is "Assigned"')
    }
    if (errors.length > 0) {
        throw new UserInputError('Invalid input(s)', { errors });
      }
}

async function issueAdd(_,{ issue }) {
    validateIssue(issue);
    issue.created = new Date();
    issue.id = await getNextSequence('issues');
    const result = await db.collection('issues').insertOne(issue);
    const savedIssue = await db.collection('issues').findOne({ _id: result.insertedId });
    return savedIssue;
}


async function connectToDb() {
    const client = new MongoClient(url, 
      { useNewUrlParser: true,
        useUnifiedTopology: true
      }
      );
    await client.connect();
    console.log('Connected to MongoDB at', url);
    db = client.db();
  }



// initialising the GraphQL server
// construct an ApolloServer object defined in the apollo-server-express package
const server = new ApolloServer({
    typeDefs: fs.readFileSync("./server/schema.graphql", "utf-8"),
    resolvers,
    formatError: error => {
        console.log(error);
        return error;
    }
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


// Wait for DB Connection, then start the server, immediately executed function
(async function () {
    try {
      await connectToDb();
      // listen() is a method of the application
    // arguments: port number, optional: callback fn when server has been successfully started
      app.listen(3000, function () {
        console.log('App started on port 3000');
      });
    } catch (err) {
      console.log('ERROR:', err);
    }
  })();

