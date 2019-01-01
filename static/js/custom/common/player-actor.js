//////////////////////////////////////////
//////////////////////////////// PlayerActor
//////////////////////////////////////////
export class PlayerActor {
  constructor(pl, coreStateManager) {
    this.Player = pl; // istance of cup.Player
    this._coreStateManager = coreStateManager
  }

  sit_down(pos) {
    this._coreStateManager.submit_action('player_sit_down', [this.Player.Name, pos]);
  }

  play_card(card) {
    this._coreStateManager.submit_action('alg_play_acard', [this.Player.Name, card])
  }

  getCoreStateManager() { return this._coreStateManager; }
}