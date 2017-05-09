/**
 * index
 */

'use strict';

/* Node modules */
const EventEmitter = require('events').EventEmitter;

/* Third-party modules */
const io = require('socket.io');

/* Files */

class SocketIO extends EventEmitter {

  /**
   * Broadcast
   *
   * Broadcast to the strategy.  If the target is
   * set, it sends to that target. Otherwise, it
   * broadcasts to all connected sockets.
   *
   * @param {*} request
   * @param {*} broadcast
   */
  broadcast (request, broadcast) {
    if (broadcast.target === undefined) {
      /* Broadcast to all connected sockets */
      broadcast.target = this.getSocketId(request.socket);
    }

    if (broadcast.target) {
      /* Send to a specific target */
      const self = request.socket.nsp.to(broadcast.target);

      const args = [
        broadcast.event,
      ];

      self.emit.apply(self, args.concat(broadcast.data));
    } else {
      /* Send everywhere */
      const self = request.socket.nsp;

      const args = [
        broadcast.event,
      ];

      self.emit.apply(self, args.concat(broadcast.data));
    }
  }

  /**
   * Connect
   *
   * Handles connection to the socket. When it's connected,
   * it emits a connected event.
   *
   * @param {string} namespace
   * @param {Function[]} middleware
   * @returns {SocketIO}
   */
  connect (namespace, middleware) {
    const nsp = this.inst
      .of(namespace);

    middleware.forEach(fn => nsp.use(fn));

    nsp.on('connection', (socket) => {
      /* Send both the socket and the namespace */
      this.emit(`${namespace}_connected`, {
        socket,
        nsp,
      });
    });

    return this;
  }

  /**
   * Create Socket
   *
   * Takes the server strategy and adds a socket
   * server to it. It uses the raw http(s) object
   * from the Steeplejack server class.
   *
   * @param {{ getRawServer: * }} server
   */
  createSocket (server) {
    this.inst = io(server.getRawServer());
  }

  /**
   * Disconnect
   *
   * Disconnects from the socket
   *
   * @param {*} obj
   */
  disconnect (obj) {
    obj.socket.disconnect();
  }

  /**
   * Get Socket ID
   *
   * Gets the socket ID. This is set by
   * Socket.IO
   *
   * @param {*} obj
   * @returns {string}
   */
  getSocketId (obj) {
    return obj.socket.id;
  }

  /**
   * Join Channel
   *
   * Joins a channel on the socket
   *
   * @param {*} obj
   * @param {string} channel
   */
  joinChannel (obj, channel) {
    obj.socket.join(channel);
  }


  /**
   * Leave Channel
   *
   * Leaves the channel on the socket
   *
   * @param {*} obj
   * @param {server} channel
   */
  leaveChannel (obj, channel) {
    obj.socket.leave(channel);
  }


  /**
   * Listen
   *
   * Listens for events on the socket
   *
   * @param {*} obj
   * @param {string} event
   * @param {function} fn
   */
  listen (obj, event, fn) {
    obj.socket.on(event, fn);
  }

}

/* Export */
exports.default = () => ({
  socketIOLib: io,
  SocketIO,
});

exports.inject = {
  name: 'steeplejack-socketio',
};
