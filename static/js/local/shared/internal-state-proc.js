//////////////////////////////////////////
//////////////////////////////// yeldInternalProcess
//////////////////////////////////////////
let yeldInternalProcess = function* (intStProc) {
  // perpetual sequence with generator
  // returns 
  // { done: false, value: the sum of _action_queued and _proc_queue still pending }
  //this._proc_queue.log_state();
  //this._action_queued.log_state();
  while (true) {
    if (intStProc._suspend_queue_proc) {
      yield 0;
    }
    while (intStProc._proc_queue.has_items() && !intStProc._suspend_queue_proc) {
      intStProc._proc_queue.process_first();
      yield intStProc._proc_queue.size() + intStProc._action_queued.size()
    }
    if (intStProc._suspend_queue_proc) {
      yield 0;
    }
    if (intStProc._action_queued.has_items()) {
      intStProc._action_queued.process_first();
    }
    if (intStProc._suspend_queue_proc) {
      yield 0;
    }
    //this._proc_queue.log_state();
    //this._action_queued.log_state();

    yield intStProc._proc_queue.size() + intStProc._action_queued.size();
  }
}

//////////////////////////////////////////
//////////////////////////////// InternalStateProc
//////////////////////////////////////////
export class InternalStateProc {

  constructor(action_queued, proc_queue) {
    this._suspend_queue_proc = false;
    this._num_of_suspend = 0;
    this._proc_queue = proc_queue;
    this._action_queued = action_queued;
  }

  get_action_queue() { return this._action_queued; }
  get_proc_queue() { return this._proc_queue; }

  suspend_proc_gevents(str) {
    this._suspend_queue_proc = true;
    this._num_of_suspend += 1;
    console.log('suspend_proc_gevents (' + str + ' add lock ' + this._num_of_suspend + ')');
  }

  clear() {
    this._action_queued.clear();
    this._proc_queue.clear();
    this._num_of_suspend = 0;
  }

  continue_process_events(str1) {
    var str = str1 || '--';
    if (this._num_of_suspend <= 0) { return; }

    this._num_of_suspend -= 1;
    if (this._num_of_suspend <= 0) {
      this._num_of_suspend = 0;
      this._suspend_queue_proc = false;
      console.log('Continue to process core events (' + str + ')');
      this.process_next();
    } else {
      console.log('Suspend still locked (locks: ' + this._num_of_suspend + ') (' + str + ')');
    }
  }

  process_next() {
    return yeldInternalProcess(this).next();
  }
}