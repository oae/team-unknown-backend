const debug = require('debug')('pb:liveLocation');
const _ = require('lodash');
const WebSocket = require('ws');
const EventEmitter = require('events').EventEmitter;
const Redis = require('ioredis');

const { ChannelNotExistsError, MethodNotFoundError } = require('./errors');
const config = require('./config');

class LiveLocation extends EventEmitter {
  constructor() {
    super();
    this.handleMessage = this.handleMessage.bind(this);

    this.sub = new Redis(config.mainRedis);
    this.pub = new Redis(config.mainRedis);
    this.init();
  }

  handleMessage(channel, message) {
    try {
      const msg = JSON.parse(message);
      debug('message received from redis %o', msg);
      this.emit(`live-location.${msg.id}`, msg.loc);
    } catch (err) {
      debug('error while handling redis message %s', err.stack);
    }
  }

  async updateLocation(payload) {
    const { loc, id } = payload;

    this.pub.publish(
      'live-location',
      JSON.stringify({
        id,
        loc,
      })
    );
  }

  async call(methodName, payload) {
    if (methodName === 'update-location') {
      return this.updateLocation(payload);
    } else {
      throw new MethodNotFoundError(`There is no method named ${methodName}`);
    }
  }

  async init() {
    await this.sub.subscribe('live-location');
    this.sub.on('message', this.handleMessage);
  }
}

const liveLocation = new LiveLocation();

const wss = new WebSocket.Server({ port: process.env.PORT });

function sendMessage(ws, type, payload, extra) {
  ws.send(JSON.stringify({ type, ...extra, payload }));
}

function parseMessage(message) {
  return JSON.parse(message);
}

const messageHandler = {
  async subscribe(ws, msg) {
    if (msg.channel !== 'live-location') {
      throw new ChannelNotExistsError(
        `There is no channel named ${msg.channel}`
      );
    }

    sendMessage(ws, 'response', { error: false }, { channel: msg.channel });

    const handleLocationUpdate = loc => {
      sendMessage(ws, 'notification', { loc }, { channel: 'live-location' });
    };

    liveLocation.on(`live-location.${msg.payload.id}`, handleLocationUpdate);

    ws.on('close', () => {
      liveLocation.removeListener(
        `live-location.${msg.payload.id}`,
        handleLocationUpdate
      );
    });
  },

  async method(ws, msg) {
    const methodName = msg.method;
    await liveLocation.call(methodName, msg.payload);
  },

  async error(ws, msg) {
    debug('error on client %o', msg.payload);
  },
};

async function handleWebsocketConnection(ws) {
  async function handleWebsocketMessage(message) {
    try {
      const msg = parseMessage(message);
      const handler = messageHandler[msg.type];

      debug('received %o', msg);

      if (!_.isFunction(handler)) {
        debug('message type not found %s', msg.type);
        throw new MethodNotFoundError(`There is no method named ${msg.type}`);
      }

      handler(ws, msg);
    } catch (err) {
      debug('error while handling WebsocketMessage %s', err.stack);
      sendMessage(ws, 'error', { name: err.constructor.name });
    }
  }
  function cleanup() {
    ws.removeEventListener('message', handleWebsocketMessage);
  }
  try {
    debug('a client connected');
    ws.on('message', handleWebsocketMessage);
    ws.on('close', () => {
      debug('client disconnected');
      cleanup();
    });
  } catch (err) {
    debug('error happened in ws message %s', err.stack);
    cleanup();
    throw err;
  }
}

async function initSocket() {
  try {
    wss.on('connection', handleWebsocketConnection);
  } catch (err) {
    wss.off('connection', handleWebsocketConnection);
    debug('error happened in websocketserver %s', err.stack);
    debug('reinitializing websocket in 1000ms');

    setTimeout(initSocket, 1000);
  }
}

async function main() {
  await initSocket();
}

main();
