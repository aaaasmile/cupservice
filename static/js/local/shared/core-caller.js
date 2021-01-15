//////////////////////////////////////////
//////////////////////////////// CoreCaller
//////////////////////////////////////////
export class CoreCaller {
  constructor(player_name, coreStateManager) {
    this._player_name = player_name
    this._coreStateManager = coreStateManager
  }

  // NOTE: a prefix 'act' is attached to the action (e.g player_sit_down => act_player_sit_down)
  play_card(card) {
    if (this._coreStateManager) {
      this._coreStateManager.submit_action('alg_play_acard', [this._player_name, card])
    }
  }

  continue_game() {
    if (this._coreStateManager) {
      this._coreStateManager.submit_action('alg_continue_game', [this._player_name])
    }
  }

  player_resign() {
    if (this._coreStateManager) {
      this._coreStateManager.submit_action('alg_player_resign', [this._player_name])
    }
  }

  dispose() {
    if (this._coreStateManager) {
      this._coreStateManager = null
      this._player_name = null
    }
  }
}