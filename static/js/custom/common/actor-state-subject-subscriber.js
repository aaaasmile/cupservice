import {StateHandlerCaller} from './state-handler-caller.js'

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
      .subscribe(next => {
        try {
          if (opt.log_all) { console.log(next); }
          let name_hand = 'on_all_' + next.event;
          this._stateHandlerCaller.call(next.event, name_hand, next.args);
        } catch (e) {
          this.handle_error(e)
        }
      });
    this._playerSubject = this._coreStateManager.get_subject_for_player(player_name)
      .subscribe(next => {
        try {
          if (this.opt.log_all) { console.log(next); }
          let name_hand = 'on_pl_' + next.event;
          this._stateHandlerCaller.call(next.event, name_hand, next.args);
        } catch (e) {
          this.handle_error(e)
        }
      });
  }

  handle_error(ex){
    console.error(`Processor is ${this._processor.constructor.name}, error is ${ex}`);
    // nothing to do more
    this.dispose()
  }

  dispose() {
    if (this._playerSubject != null) {
      this._playerSubject.unsubscribe();
      this._playerSubject = null;
    }
    if (this._subscription != null) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }
  }
}
