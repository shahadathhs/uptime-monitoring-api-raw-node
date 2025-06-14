// dependencies
const server = require("./app/lib/server");
const workers = require("./app/lib/worker");

// app object - module scaffolding
const app = {};

app.init = () => {
  // start the server
  server.init();
  // start the workers
  workers.init();
};

app.init();

// export the app
module.exports = app;
