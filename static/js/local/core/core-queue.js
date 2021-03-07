//////////////////////////////////////////
//////////////////////////////// coreQueue
//////////////////////////////////////////
export class CoreQueue {
  constructor(queue_name, coreStateManager) {
    this.registry = [];
    this._coreStateManager = coreStateManager
    this._queue_name = queue_name
  }

  submit(func, args) {
    if (func == null) { throw (new Error('Handler is null')); }
    this.registry.push({ func: func, parameters: [args] });
    //console.log("Item submitted, queue size: " + this.registry.length + ' on ' + this._queue_name);
  }

  process_first() {
    //console.log('item process START, queue size: ' + this.registry.length + ' on ' + this._queue_name)
    if (this.registry.length == 0) {
      return;
    }
    var funinfo = this.registry.shift();
    funinfo.func.apply(this._coreStateManager, funinfo.parameters);
    //console.log('item process END, queue size: ' + this.registry.length + ' on ' + this._queue_name)
  }

  has_items() {
    return this.registry.length > 0 ? true : false;
  }

  size() {
    return this.registry.length;
  }

  log_state() {
    console.log('queue: ' + this.queue_name + ' with items ' + this.registry.length);
  }

  clear() {
    this.registry = [];
  }

}

