//////////////////////////////////////////
//////////////////////////////// PlayerActor
//////////////////////////////////////////
export class PlayerActor {
  constructor(pl, coreStateManager) {
    this.Player = pl; // istance of cup.Player
    this._coreStateManager = coreStateManager
  }

  // NOTE: a prefix 'act' is attached to the action (e.g player_sit_down => act_player_sit_down)
  sit_down(pos) {
    this._coreStateManager.submit_action('player_sit_down', [this.Player.Name, pos]);
  }

  play_card(card) {
    this._coreStateManager.submit_action('alg_play_acard', [this.Player.Name, card])
  }

  continue_game(player){
    this._coreStateManager.submit_action('alg_continue_game', [player])
  }

  getCoreStateManager() { return this._coreStateManager; }
}