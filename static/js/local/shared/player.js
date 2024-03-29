import { ActorStateSubjectSubscriber } from './actor-state-subject-subscriber.js?version=100'
import { CoreCaller } from './core-caller.js?version=100'

//////////////////////////////////////////
//////////////////////////////// Player
//////////////////////////////////////////
export class Player {
  constructor(alg, coreStateManager) {
    this._core_caller = null
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

  set_avatar(avatar_name, detail) {
    this._avatar_detail = detail
    this._avatar_name = avatar_name
  }

  set_gfx_on_alg(algGfx, fncbSetCaller) {
    if (this._gfxSubscriber) {
      this._gfxSubscriber.dispose()
    }
    this._alg.set_automatic_playing(false)
    this._gfxSubscriber = new ActorStateSubjectSubscriber(
      this._coreStateManager,
      algGfx,
      { log_all: false, log_missed: true },
      this._name
    );
    fncbSetCaller(this._core_caller, this._alg)
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
    if (this._gfxSubscriber) {
      this._gfxSubscriber.dispose()
      this._gfxSubscriber = null
    }
  }
}