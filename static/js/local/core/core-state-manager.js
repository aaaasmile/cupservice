
import { CoreQueue } from './core-queue.js?version=100'
import { InternalStateProc } from '../shared/internal-state-proc.js?version=100'
import { CoreReactor } from './core-reactor.js?version=100'

//////////////////////////////////////////
//////////////////////////////// CoreStateManager
//////////////////////////////////////////
export class CoreStateManager {
  // Lo scopo di questa classe è quello di avere un unico processore di stati
  // che viene usato attraverso diverse classi, come CoreBriscolaBase e TableStateCore.
  // In CoreStateManager viene pubblicata una serie di funzioni che vengono usate
  // anche per pubblicare eventi al player
  // CoreBriscolaBase e TableStateCore non si cambiano stati e eventi, ma sono osservatori
  // dell'unico oggetto che contiene lo stato attuale e le sue code di eventi. 
  // internalStateProc invece gestisce internamente le code e gli switch degli stati.
  constructor() {
    this._alg_action_queue = new CoreQueue("alg-action", this);
    this._core_state_queue = new CoreQueue("core-state", this);
    this._subjectStateAction = new CoreReactor();
    this.event_for_all = new CoreReactor();

    this.event_for_player = {};
    this._internalStateProc = new InternalStateProc(this._alg_action_queue, this._core_state_queue);
  }

  process_next() { return this._internalStateProc.process_next(); }

  get_subject_state_action() {
    return this._subjectStateAction;
  }

  submit_next_state(name_st) {
    this._core_state_queue.submit((args) => {
      this._subjectStateAction.dispatchNextEvent(args)
    }, { is_action: false, name: name_st, args_arr: [] });
  }

  force_next_state(name_st) {
    this._internalStateProc.clear()
    this._core_state_queue.clear()
    this._core_state_queue.submit((args) => {
      this._subjectStateAction.dispatchNextEvent(args)
    }, { is_action: false, name: name_st, args_arr: [] });
  }

  fire_all(event_name, args_payload) {
    this.event_for_all.dispatchNextEvent({ event: event_name, args: args_payload });
  }

  fire_to_player(player, event_name, args_payload) {
    this.get_subject_for_player(player).dispatchNextEvent({ event: event_name, args: args_payload });
  }

  clear_gevent() {
    this._internalStateProc.clear();
  }

  suspend_proc_gevents(str) { this._internalStateProc.suspend_proc_gevents(str); }
  continue_process_events(str) { this._internalStateProc.continue_process_events(str); }

  submit_action(action_name, act_args) {
    this._alg_action_queue.submit((args) => {
      this._subjectStateAction.dispatchNextEvent(args)
    }, { is_action: true, name: action_name, args_arr: act_args })
  }

  get_subject_for_all_players() {
    return this.event_for_all;
  }

  get_subject_for_player(player) {
    if (!player) {
      throw new Error('Player is invalid: ', player)
    }
    if (this.event_for_player[player] == null) { // Oh yes use == instead of ===
      this.event_for_player[player] = new CoreReactor();
    }
    return this.event_for_player[player];
  }

  process_all() {
    let resProc = this._internalStateProc.process_next();
    while (resProc.value > 0) {
      resProc = this._internalStateProc.process_next();
    }
  }
}
