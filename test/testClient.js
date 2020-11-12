const EventEmitter = require('events');
const { Client, PLUGIN_ROOM } = require('../server/client.js');

let client = new Client();
client.installPlugin(PLUGIN_ROOM);

client.on('sync', bluePrint => {
    console.log(bluePrint);
});

client.login('NAME');

let outerEventEmitter = new EventEmitter();
client.pipeEventEmitter(outerEventEmitter);

outerEventEmitter.emit('api', 'logout');
outerEventEmitter.on('sync', bluePrint => {
    console.log(`Receive bluePrint ${JSON.stringify(bluePrint)}`);
});
client.emit('sync', { test: 1});

outerEventEmitter.emit('api', 'NOT_EXIST_API');