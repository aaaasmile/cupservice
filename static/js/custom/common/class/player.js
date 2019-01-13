import { ActorStateSubjectSubscriber } from './actor-state-subject-subscriber.js'
import { CoreCaller } from './core-caller.js'

//////////////////////////////////////////
//////////////////////////////// Player
//////////////////////////////////////////
export class Player {
  constructor(alg, coreStateManager, name) {
    this._name = name
    if (alg) {
      this.set_alg(alg, coreStateManager)
    } else {
      this._coreStateManager = coreStateManager
    }
  }

  set_alg(alg, coreStateManager) {
    this._name = alg._player_name
    this._coreStateManager = coreStateManager
    this._alg = alg
    if (this._core_caller) {
      this._core_caller.dispose()
    }
    this._core_caller = new CoreCaller(alg._player_name, coreStateManager)
    this._alg.set_core_caller(this._core_caller)
    // _actorSubscriber: serve per ricevere gli eventi del core in un handler automatico
    // del tipo on_all_xxx e gli eventi on_pl_xxx. Eventi gestiti in alg
    if (this._actorSubscriber) {
      this._actorSubscriber.dispose()
    }
    this._actorSubscriber = new ActorStateSubjectSubscriber(
      coreStateManager,
      alg,
      { log_all: false, log_missed: true },
      alg._player_name
    );
  }

  sit_down(pos) {
    this._sit_position = pos
    this._coreStateManager.submit_action('player_sit_down', [this._name, pos]);
  }

  dispose() {
    if (this._core_caller) {
      this._core_caller.dispose()
      this._core_caller = null
    }
    if (this._actorSubscriber) {
      this._actorSubscriber.dispose()
      this._actorSubscriber = null
    }
  }
}