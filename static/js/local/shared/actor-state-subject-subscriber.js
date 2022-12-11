import { StateHandlerCaller } from './state-handler-caller.js?version=100'

//////////////////////////////////////////
//////////////////////////////// ActorStateSubjectSubscriber
//////////////////////////////////////////
export class ActorStateSubjectSubscriber {

  constructor(coreStateManager, processor, opt, player_name) {
    this.opt = opt || { log_missed: false, log_all: false }
    this._coreStateManager = coreStateManager;
    this._stateHandlerCaller = new StateHandlerCaller(processor, opt)
    this._playerSubject = null;
    this._processor = processor
    this._subscription = coreStateManager.get_subject_for_all_players()
    
    this.subsc_cb = this._subscription.addNextEventListener(next => {
      if (opt.log_all) { console.log(next); }
      let name_hand = 'on_all_' + next.event;
      this._stateHandlerCaller.call(next.event, name_hand, next.args);
    });

    this._playerSubject = this._coreStateManager.get_subject_for_player(player_name)
    this.subsc_cb2 = this._playerSubject.addNextEventListener(next => {
      if (this.opt.log_all) { console.log(next); }
      let name_hand = 'on_pl_' + next.event;
      this._stateHandlerCaller.call(next.event, name_hand, next.args);
    });
  }

  dispose() {
    if (this._playerSubject != null) {
      this._playerSubject.removeNextEventListener(this.subsc_cb2)
      this._playerSubject = null;
    }
    if (this._subscription != null) {
      this._subscription.removeNextEventListener(this.subsc_cb)
      this._subscription = null;
    }
  }
}
