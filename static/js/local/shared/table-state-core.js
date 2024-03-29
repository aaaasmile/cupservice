import { CoreStateStore } from '../core/core-state-store.js?version=100'
import { CoreStateSubjectSubscriber } from '../core/core-state-subject-subscriber.js?version=100'
import { CoreReactor } from '../core/core-reactor.js?version=100'

//////////////////////////////////////////
//////////////////////////////// TableStateCore
//////////////////////////////////////////
export class TableStateCore {

  constructor(coreStateManager, numOfPlayers) {
    this._coreStateManager = coreStateManager
    this._currNumPlayers = 0
    this._numOfPlayers = numOfPlayers
    this._players = []; //array of names as string. Ex: ['CPU', 'ME']
    this._coreStateStore = new CoreStateStore()
    this.TableFullSub = new CoreReactor();
    let that = this;
    this._subscriber = new CoreStateSubjectSubscriber(coreStateManager, that, { log_missed: false });
    this._coreStateManager.submit_next_state('st_waiting_for_players');
  }

  ignore_state_or_action(state) {
    let ignored = [] // write here states if someone needs to be ignored
    return ignored.indexOf(state) >= 0
  }

  st_waiting_for_players() {
    this._coreStateStore.set_state('st_waiting_for_players')
    console.log('Waiting for players');
  }

  st_table_partial() {
    this._coreStateStore.set_state('st_table_partial')
    console.log('Table is filling');
  }

  st_table_full() {
    this._coreStateStore.set_state('st_table_full')
    console.log("Table is full with " + this._currNumPlayers + " players: " + this._players.join(','));
    this.TableFullSub.dispatchNextEvent({ players: this._players })
  }

  act_player_sit_down(name, pos) {
    console.log("Player " + name + " sit on pos " + pos);
    this._currNumPlayers += 1;
    while (this._players.length < pos) {
      this._players.push('');
    }
    this._players[pos] = name;
    if (this._currNumPlayers >= this._numOfPlayers) {
      this._currNumPlayers = this._numOfPlayers;
      this._coreStateManager.submit_next_state('st_table_full');
    } else {
      this._coreStateManager.submit_next_state('st_table_partial');
    }
  }

  dispose() {
    if (this._subscriber != null) {
      this._subscriber.dispose();
      this._subscriber = null;
    }
  }

}
