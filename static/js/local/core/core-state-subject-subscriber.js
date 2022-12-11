import { StateHandlerCaller } from '../shared/state-handler-caller.js?version=100'

//////////////////////////////////////////
//////////////////////////////// CoreStateSubjectSubscriber
//////////////////////////////////////////
// Serve per gestire eventi del tipo act_XXX che sono actions.
// Questi action handler sono del tipo act_player_sit_down e si trovano normalmente
// implementate nel core tipo CoreBriscolaBase. 
// In principio un evento nel Subject dell'oggetto CoreStateManager viene lanciato.
// In questa classe viene ricevuto quest'evento e chiamato automaticamante la funzione handler
// del core.
export class CoreStateSubjectSubscriber {

  constructor(coreStateManager, processor, opt) {
    this.opt = opt || { log_missed: false, log_all: false }
    this._coreStateManager = coreStateManager;
    this._processor = processor
    this._stateHandlerCaller = new StateHandlerCaller(processor, opt)
    this._subscription = coreStateManager.get_subject_state_action()
    this.subsc_next_cb = this._subscription.addNextEventListener(next => {
      if (opt.log_all) { console.log(next); }
      let name_hand = next.name;
      if (next.is_action) {
        name_hand = 'act_' + name_hand;
      }
      this._stateHandlerCaller.call(next.name, name_hand, next.args_arr);
    });
  }

  dispose() {
    if (this._subscription != null) {
      this._subscription.removeNextEventListener(this.subsc_next_cb);
      this._subscription = null;
    }
  }

}