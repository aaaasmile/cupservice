function CoreEvent(name) {
    this.name = name;
    this.callbacks = [];
}

CoreEvent.prototype.registerCallback = function (callback) {
    this.callbacks.push(callback);
}

CoreEvent.prototype.unregisterCallback = function (callback) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
        console.log('Remove callback with index ', index)
        this.callbacks.splice(index, 1);
    }else{
        console.error('Callback not found ', callback)
    }
}

export function CoreReactor() {
    this.events = {};
}

CoreReactor.prototype.registerEvent = function (eventName) {
    var event = new CoreEvent(eventName);
    this.events[eventName] = event;
};

CoreReactor.prototype.dispatchEvent = function (eventName, eventArgs) {
    this.events[eventName].callbacks.forEach(function (callback) {
        callback(eventArgs);
    });
};

CoreReactor.prototype.addEventListener = function (eventName, callback) {
    this.events[eventName].registerCallback(callback);
    return callback
};

CoreReactor.prototype.removeEventListener = function (eventName, callback) {
    this.events[eventName].unregisterCallback(callback);
};