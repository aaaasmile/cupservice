// CoreReactor very simple event / dispacth / subscribe pattern
// 'next' is a builtin event
// Code example:

// var subj = new CoreReactor();

// cb = subj.addNextEventListener((args) => {
//   console.log('next event is raised with args ', args);
// });

// subj.dispatchNextEvent('hello');
// subj.removeNextEventListener(cb)

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

const nextEventName = 'next'

export function CoreReactor() {
    this.events = {};
    this.registerEvent(nextEventName)
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

CoreReactor.prototype.dispatchNextEvent = function (eventArgs) {
    this.events[nextEventName].callbacks.forEach(function (callback) {
        callback(eventArgs);
    });
};


CoreReactor.prototype.addNextEventListener = function (callback) {
    this.events[nextEventName].registerCallback(callback);
    return callback
};

CoreReactor.prototype.removeNextEventListener = function (callback) {
    this.events[nextEventName].unregisterCallback(callback);
};

CoreReactor.prototype.addEventListener = function (eventName, callback) {
    this.events[eventName].registerCallback(callback);
    return callback
};

CoreReactor.prototype.removeEventListener = function (eventName, callback) {
    this.events[eventName].unregisterCallback(callback);
};


