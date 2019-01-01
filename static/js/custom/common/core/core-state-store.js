//////////////////////////////////////////
//////////////////////////////// CoreStateStore
//////////////////////////////////////////
export class CoreStateStore {
  constructor() {
    this._internal_state = '';
  }

  set_state(state_name) {
    console.log(state_name);
    this._internal_state = state_name;
  }

  check_state(state_name) {
    if (this._internal_state !== state_name) {
      throw (new Error('Event expected in state ' + state_name + ' but now is ' + this._internal_state));
    }
  }
  get_internal_state() {
    return this._internal_state
  }
}