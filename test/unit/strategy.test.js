/**
 * index.test
 */

"use strict";

/* Node modules */
const EventEmitter = require('events').EventEmitter;

/* Third-party modules */
const io = require('socket.io');

/* Files */
const helpers = require('../helpers/setup');
const obj = require('../../src/strategy');

const expect = helpers.expect;
const proxyquire = helpers.proxyquire;
const sinon = helpers.sinon;

describe("Socket.IO tests", function () {

  beforeEach(function () {

    this.socketRequest = {
      emit: sinon.stub(),
      params: [],
      socket: {
        socket: {
          disconnect: sinon.spy(),
          id: "socketId",
          join: sinon.spy(),
          leave: sinon.spy(),
          on: sinon.stub()
        },
        nsp: {
          emit: sinon.stub(),
          to: sinon.stub()
        }
      },
      broadcast: sinon.stub(),
      disconnect: sinon.stub(),
      getId: sinon.stub(),
      joinChannel: sinon.stub(),
      leaveChannel: sinon.stub(),
      data: []
    };

    expect(obj).to.have.keys([
      'default',
      'inject'
    ]);

    expect(obj.inject).to.be.eql({
      name: 'steeplejack-socketio'
    });

    const out = obj.default();

    expect(out).to.have.keys([
      'socketIOLib',
      'SocketIO'
    ]);

    expect(out.socketIOLib).to.be.equal(io);
    expect(out.SocketIO).to.be.a('function');

    this.SocketIO = out.SocketIO;

    this.inst = new this.SocketIO();

  });

  describe("#broadcast", function () {

    it("should send to the socket id if no target set", function () {

      const emitter = sinon.spy();
      emitter.emit = sinon.spy();

      this.socketRequest.socket.nsp.to.returns(emitter);

      const broadcast = {
        event: "some event",
        data: [
          1, 2, 5
        ]
      };

      expect(this.inst.broadcast(this.socketRequest, broadcast)).to.be.undefined;

      expect(this.socketRequest.socket.nsp.to).to.be.calledOnce
        .calledWithExactly("socketId");

      expect(emitter.emit).to.be.calledOnce
        .calledWithExactly("some event", 1, 2, 5);

    });

    it("should send to target", function () {

      const emitter = sinon.spy();
      emitter.emit = sinon.spy();

      this.socketRequest.socket.nsp.to.returns(emitter);

      const broadcast = {
        event: "some event2",
        target: "some target",
        data: [
          1, 2, 5, 6
        ]
      };

      expect(this.inst.broadcast(this.socketRequest, broadcast)).to.be.undefined;

      expect(this.socketRequest.socket.nsp.to).to.be.calledOnce
        .calledWithExactly("some target");

      expect(emitter.emit).to.be.calledOnce
        .calledWithExactly("some event2", 1, 2, 5, 6);

    });

    it("should send to everything if target is null", function () {

      const broadcast = {
        event: "some2 event2",
        target: null,
        data: [
          1, 3, 5
        ]
      };

      expect(this.inst.broadcast(this.socketRequest, broadcast)).to.be.undefined;

      expect(this.socketRequest.socket.nsp.emit).to.be.calledOnce
        .calledWithExactly("some2 event2", 1, 3, 5);

    });

  });

  describe("#connect", function () {

    beforeEach(function () {
      this.sock = {
        of: sinon.stub(),
        use: sinon.stub()
      };
      this.sock.of.returns(this.sock);
      this.inst.inst = this.sock;
    });

    it("should set middleware and emit a connect event", function (done) {

      const emit = sinon.spy(this.inst, "emit");

      this.sock.on = (eventName, fn) => {

        expect(fn("socket")).to.be.undefined;

        expect(eventName).to.be.equal("connection");

        expect(emit).to.be.calledOnce
          .calledWithExactly("/namespace/event_connected", {
            socket: "socket",
            nsp: this.sock
          });

        done();

      };

      const fn = [
        () => {},
        () => {}
      ];

      expect(this.inst.connect("/namespace/event", fn)).to.be.equal(this.inst);


    });

  });

  describe("#createSocket", function () {

    beforeEach(function () {

      class Strategy extends EventEmitter {
      }

      const strat = new Strategy();
      strat.getRawServer = sinon.stub()
        .returns("server");

      const io = sinon.stub()
        .returns("inst");

      const SocketIO = proxyquire("../../src/strategy", {
        "socket.io": io
      }).SocketIO;

      const sock = new SocketIO();

      expect(sock.createSocket(strat)).to.be.undefined;

      expect(sock.inst).to.be.equal("inst");
    });

  });

  describe("#disconnect", function () {

    it("should call the disconnect on the socket", function () {

      expect(this.inst.disconnect(this.socketRequest.socket)).to.be.undefined;

      expect(this.socketRequest.socket.socket.disconnect).to.be.calledOnce
        .calledWithExactly();

    });

  });

  describe("#getSocketId", function () {

    it("should return the socketId", function () {

      expect(this.inst.getSocketId(this.socketRequest.socket)).to.be.equal("socketId");

    });

  });

  describe("#joinChannel", function () {

    it("should join the channel", function () {

      expect(this.inst.joinChannel(this.socketRequest.socket, "channelName")).to.be.undefined;

      expect(this.socketRequest.socket.socket.join).to.be.calledOnce
        .calledWithExactly("channelName");

    });

  });

  describe("#leaveChannel", function () {

    it("should leave the channel", function () {

      expect(this.inst.leaveChannel(this.socketRequest.socket, "channelName")).to.be.undefined;

      expect(this.socketRequest.socket.socket.leave).to.be.calledOnce
        .calledWithExactly("channelName");

    });

  });

  describe("#listen", function () {

    it("should listen to events", function () {

      const fn = () => {};

      expect(this.inst.listen(this.socketRequest.socket, "eventName", fn)).to.be.undefined;

      expect(this.socketRequest.socket.socket.on).to.be.calledOnce
        .calledWithExactly("eventName", fn);

    });

  });

});
