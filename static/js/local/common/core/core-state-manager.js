
import {CoreQueue} from './core-queue.js'
import {InternalStateProc} from '../class/internal-state-proc.js'

//////////////////////////////////////////
//////////////////////////////// CoreStateManager
//////////////////////////////////////////
export class CoreStateManager {
  // _env: 'develop', 'production'
  // Lo scopo di questa classe è quello di avere un unico processore di stati
  // che viene usato attraverso diverse classi, come CoreBriscolaBase e TableStateCore.
  // In CoreStateManager viene pubblicata una serie di funzioni che vengono usate
  // anche per pubblicare eventi al player
  // CoreBriscolaBase e TableStateCore non si cambiano stati e eventi, ma sono osservatori
  // dell'unico oggetto che contiene lo stato attuale e le sue code di eventi. 
  // internalStateProc invece gestisce internamente le code e gli switch degli stai.
  constructor(_env) {
    let that = this;
    this._alg_action_queue = new CoreQueue("alg-action", that);
    this._core_state_queue = new CoreQueue("core-state", that);
    this._subjectStateAction = new rxjs.Subject();
    this.event_for_all = new rxjs.Subject();

    this.event_for_player = {};
    this._internalStateProc = new InternalStateProc(
      this._alg_action_queue,
      this._core_state_queue,
      _env);
  }

  // ICore
  process_next() { return this._internalStateProc.process_next(); }

  get_subject_state_action() {
    return this._subjectStateAction;
  }

  submit_next_state(name_st) {
    let that = this;
    this._core_state_queue.submit(function (args) {
      that._subjectStateAction.next(args)
    }, { is_action: false, name: name_st, args_arr: [] });
  }

  fire_all(event_name, args_payload) {
    this.event_for_all.next({ event: event_name, args: args_payload });
  }

  fire_to_player(player, event_name, args_payload) {
    this.get_subject_for_player(player).next({ event: event_name, args: args_payload });
  }

  clear_gevent() {
    this._internalStateProc.clear();
  }

  // IActorHandler
  suspend_proc_gevents(str) { this._internalStateProc.suspend_proc_gevents(str); }
  continue_process_events(str) { this._internalStateProc.continue_process_events(str); }

  submit_action(action_name, act_args) {
    let that = this;
    this._alg_action_queue.submit(function (args) {
      that._subjectStateAction.next(args)
    }, { is_action: true, name: action_name, args_arr: act_args })
  }

  get_subject_for_all_players() {
    return this.event_for_all;
  }

  get_subject_for_player(player) {
    if(!player){
      throw new Error('Player is invalid: ', player)
    }
    if (this.event_for_player[player] == null) { // Oh yes use == instead of ===
      this.event_for_player[player] = new rxjs.Subject();
    }
    return this.event_for_player[player];
  }

  // other
  process_all() {
    let resProc = this._internalStateProc.process_next();
    while (resProc.value > 0) {
      resProc = this._internalStateProc.process_next();
    }
  }
}
