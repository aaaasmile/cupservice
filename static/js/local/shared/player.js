import { ActorStateSubjectSubscriber } from './actor-state-subject-subscriber.js'
import { CoreCaller } from './core-caller.js'

//////////////////////////////////////////
//////////////////////////////// Player
//////////////////////////////////////////
export class Player {
  constructor(alg, coreStateManager, name) {
    this._core_caller = null
    this._name = name
    if (alg) {
      this.set_alg(alg, coreStateManager)
    } else {
      this._coreStateManager = coreStateManager
    }
    
  }

  set_avatar(avatar_name, detail){
    this._avatar_detail = detail
    this._avatar_name = avatar_name
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

  set_gfx_on_alg(gfx) {
    if (!this._core_caller || !this._alg) {
      throw (new Error('_core_caller or _alg is not available, do you have called set_alg before?'))
    }
    if (this._gfxSubscriber) {
      this._gfxSubscriber.dispose()
    }
    this._alg.set_automatic_playing(false)
    this._gfxSubscriber = new ActorStateSubjectSubscriber(
      this._coreStateManager,
      gfx,
      { log_all: false, log_missed: true },
      this._name
    );
    return this._core_caller
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