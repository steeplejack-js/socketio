# Steeplejack SocketIO

[SocketIO](http://socket.io) strategy for [Steeplejack](http://getsteeplejack.com)

# Usage

In your [Steeplejack](http://getsteeplejack.com) bootstrapping, you'll need to import this SocketIO plugin into the
`modules` section:

> You will need to also include an HTTP server strategy. This example uses Restify, but you can use any of the other
> HTTP strategies in exactly the same way.

### app.js

```javascript
const Steeplejack = require('steeplejack');
const restify = require('@steeplejack/restify');
const socketIO = require('@steeplejack/socketio');

/* Bootstrap the Steeplejack app */
const app = Steeplejack.app({
  config: {},
  modules: [
    `${__dirname}/!(node_modules|routes)/**/*.js`,
    restify,
    socketIO,
  ],
  routesDir: `${__dirname}/routes`,
});

app.run(['server'], server => server);
```

### server.js

```javascript
exports.default = (Server, config, { Restify }, { SocketIO }) => {
  const restify = new Restify();
  const socketIo = new SocketIO();

  /* Add the websocket strategy as the third argument */
  return new Server(config.server, restify, socketIo);
};

exports.inject = {
  name: 'server',
  deps: [
    'steeplejack-server',
    '$config',
    'steeplejack-restify',
    'steeplejack-socketio',
  ],
};
```

This attaches the SocketIO strategy to the current HTTP server allowing you to make websocket connections on the same
server and port as your HTTP server.

The `steeplejack-socketio` dependency exposes two elements, `SocketIO` (the strategy) and `SocketIOLib` (the socketio 
library).

# License

MIT License
