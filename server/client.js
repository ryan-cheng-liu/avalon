const EventEmitter = require('events');

class Client extends EventEmitter {
    constructor() {
        super();

        this.data = {};
        this.model = {};

        this.properties = {};

        this._private_blueprint_change_buffer = {};
        this._private_model_change_timer = null;

        this.installPlugin(PLUGIN_BASIC);

        this.eventEmitter = null;

        return new Proxy(this, {
            get(target, name) {
                if (name in target) {
                    let value = target[name];
                    if (typeof value === 'function') return value.bind(target);
                    else return value;
                }
                else {
                    return target.data[name];
                }
            },
            set(obj, prop, value) {
                if (typeof value === 'function') {
                    obj[prop] = value;
                }
                else {
                    obj.data[prop] = value;

                    const properties = obj.properties;
                    if (properties && prop in properties) {
                        obj.modifyLeaf(obj.model, properties[prop](value));
                    }
                }
                return true;
            },
        });
    }

    _apiCall() {
        this.emit.apply(this, ['api', ...arguments]);
    }
    ////////////////////////////////////////

    clientDisconnect() {
        this._apiCall('clientDisconnect');
    }

    ////////////////////////////////////////

    installPlugin(plugin) {
        const apiNames = plugin.apiNames;
        if (apiNames) {
            for (let apiName of apiNames) {
                apiName = '' + apiName;
                this[apiName] = this._apiCall.bind(this, apiName);
            }
        }

        ////////////////////////////////////

        const properties = plugin.properties;
        if (properties) {
            for (const [id, handler] of Object.entries(properties)) {
                this.properties['' + id] = handler;
            }
        }
    }

    ////////////////////////////////////////

    pipeEventEmitter(eventEmitter) {
        if (!eventEmitter || typeof eventEmitter.on !== 'function' || typeof eventEmitter.emit !== 'function') {
            return;
        }

        this.eventEmitter = eventEmitter;
        this.on('sync', eventEmitter.emit.bind(eventEmitter, 'sync'));
        eventEmitter.on('api', (apiName, ...args) => {
            if (typeof this[apiName] !== 'function') {
                return;
            }

            const apiFunc = this[apiName];
            apiFunc.apply(this, args);
        });

        eventEmitter.on('disconnect', this.clientDisconnect.bind(this));
    }

    ////////////////////////////////////////

    modifyLeaf(data, bluePrint) {
        this._modifyLeaf(data, bluePrint);
        this._modifyLeaf(this._private_blueprint_change_buffer, bluePrint);
        this.handleModelChange();
    }

    _modifyLeaf(data, bluePrint) {
        if (typeof data !== 'object' || typeof bluePrint !== 'object') return;
        if (bluePrint === null) return;
    
        for (let [key, value] of Object.entries(bluePrint)) {
            if (Array.isArray(value)) {
                if (!Array.isArray(data[key])) data[key] = [];
                for (const k of value.keys()) data[key][k] = bluePrint[key][k];
            }
            else if (typeof value === 'object') {
                if (typeof data[key] !== 'object') data[key] = {};
                this._modifyLeaf(data[key], value);
            }
            else {
                if (value === undefined) delete data[key];
                else data[key] = value;
            }
        }
    }

    handleModelChange() {
        if (this._private_model_change_timer) clearTimeout(this._private_model_change_timer);
        this._private_model_change_timer = setTimeout(() => {
            this._private_model_change_timer = null;

            this.emit('sync', this._private_blueprint_change_buffer);
            this._private_blueprint_change_buffer = {};
        }, 0);
    }

    ////////////////////////////////////////

    serialize() {
        return { id: this.data.id, name: this.data.name };
    }
}

class BasicPlugin {
    constructor() {
        this.apiNames = [
            'login',
            'logout',
        ];
        this.properties = {
            'id': value => ({ me: { id: value }}),
            'name': value => ({ me: { name: value }}),
            'location': value => ({ location: value }),
            'rooms': value => ({ leaf_lobby: { rooms: Object.values(value).map(room => room.serialize())}}),
            'room': value => ({ leaf_room: value && value.serialize()}),
        };
    }
}

class RoomPlugin {
    constructor() {
        this.apiNames = [
            'createAndJoinRoom',
            'joinRoom',
            'leaveRoom',
            'startGame',
        ];
    }
}

class ChatroomPlugin {
    constructor() {
        this.apiNames = [
            'chat',
        ];
    }
}

const PLUGIN_BASIC = new BasicPlugin();
const PLUGIN_ROOM = new RoomPlugin();
const PLUGIN_CHATROOM = new ChatroomPlugin();

const SYSTEM = new Client();
SYSTEM.id = 0;
SYSTEM.name = 'Sys';

module.exports = {
    PLUGIN_BASIC,
    PLUGIN_ROOM,
    PLUGIN_CHATROOM,
    Client,
    SYSTEM,
}