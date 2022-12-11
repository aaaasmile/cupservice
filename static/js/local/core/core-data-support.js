import { MatchInfo } from '../shared/match-info.js?version=100'

//////////////////////////////////////////
//////////////////////////////// CoreDataSupport
//////////////////////////////////////////
export class CoreDataSupport {
  constructor() {
    this.giocata_info = {
      score: new Map(), // NOTA: Map usa SEMPRE get e set. 
      points_curr: new Map(),
      giocata_state: '',
      bestpoints_info: {},
      is_started() {
        return this.giocata_state === 'Started'
      },
      set_draw() {
        this.giocata_state = 'draw'
      },
      set_end() {
        this.giocata_state = 'end'
      },
      set_started() {
        this.giocata_state = 'Started'
        this.bestpoints_info = {}
      },
      set_giocata_end_score(info) {
        this.bestpoints_info = info
      }
    };
    this.match_info = new MatchInfo();
    this.players = []; // use always simple name. e.g 'Luigi'
    this.carte_prese = {};
    this.carte_in_mano = {};
    this.carte_gioc_mano_corr = [];
    this.history_mano = [];
    this.mano_count = 0;
    this.first_player_ix = 0;
    this.round_players = [];
    this.mazzo_gioco = [];
    this.num_of_cards_onhandplayer = null
    this.max_possible_points = null
    this.player_on_turn = null;
    this.continue_to_cfm = []
  }

  setdataFromState(gamestate) {
    console.log('Core data set from state')
    const num_players = gamestate.num_players
    if (num_players !== this.players.length) { throw new Error(`Game state error. Players num do not match ${this.players.length}`) }
    this.first_player_ix = gamestate.first_giocata_player_ix
    this.round_players_by_player_ix(gamestate.curr_first_mano_player_ix)
    for (let index = 0; index < gamestate.curr_mano_played.length; index++) {
      this.round_player_has_played()
    }
    // TODO: set all other game_state information
  }

  getNumCardInHand(player_name) {
    if (this.carte_in_mano[player_name]) {
      return this.carte_in_mano[player_name].length
    }
    return 0
  }

  getCardInHand(player_name, posIx) {
    if (this.carte_in_mano[player_name]) {
      return this.carte_in_mano[player_name][posIx]
    }
    return null
  }


  get_maxpossible_points = () => {
    return this.max_possible_points
  }

  start(num_of_players, players, hand_player_size, max_possible_points) {
    // players: ["Luigi", "Ernesto"]
    console.log('CoreDataSupport start')
    this.max_possible_points = max_possible_points
    this.match_info.start();
    this.players = [];
    if (hand_player_size === undefined) {
      throw (new Error('hand_player_size is undefined'));
    }

    this.num_of_cards_onhandplayer = hand_player_size;
    for (let i = 0; i < num_of_players; i++) {
      let player = players[i];
      this.players.push(player);
      this.giocata_info.score.set(player, 0);
    }
  }

  start_new_giocata(first_ix, cards) {
    this.giocata_info.set_started();
    this.carte_prese = {};
    this.carte_in_mano = {}; //{'Luigi': ['_Ab','_7c']} 
    this.carte_gioc_mano_corr = [];
    this.history_mano = [];
    this.mano_count = 0;
    this.first_player_ix = first_ix;
    this.round_players_by_player_ix(first_ix);
    console.log('First player to play is ' + this.round_players[0] + ' with index ' + this.first_player_ix);
    console.log('Number of round_players is ' + this.round_players.length + ' players size is ' + this.players.length);
    for (let i = 0; i < this.round_players.length; i++) {
      let player = this.round_players[i];
      console.log('On this game play the player: ' + this.round_players[i]);
      this.giocata_info.points_curr.set(player, 0);
      this.carte_prese[player] = [];
      this.carte_in_mano[player] = [];
    }
    this.mazzo_gioco = cards; // array of ['_Ac', ...]
    console.log('Current deck: ' + this.mazzo_gioco.join(','));
  }

  historize_mano() {
    this.history_mano.push(this.carte_gioc_mano_corr)
    this.carte_gioc_mano_corr = []
  }

  add_points_toplayer(player, points) {
    let pcs = this.giocata_info.points_curr
    let new_val = pcs.get(player) + points
    pcs.set(player, new_val)

    console.log('Punteggio attuale: ', pcs);
  }

  get_player_opponent(player) {
    // player: 'Luigi'
    let ix = this.players.indexOf(player)
    if (ix < 0) {
      throw (new Error(`Player not found, ${player}`))
    }
    ix += 1
    if (ix >= this.players.length) {
      ix = 0
    }
    return this.players[ix]
  }

  switch_player_on_turn() {
    this.player_on_turn = this.round_players.length > 0 ? this.round_players[0] : null;
    return this.player_on_turn;
  }

  round_player_has_played() {
    this.round_players.splice(0, 1);
  }

  calc_round_players(first_ix) {
    let ins_point = -1, round_players = [], onlast = true;
    for (let i = 0; i < this.players.length; i++) {
      if (i === first_ix) {
        ins_point = 0;
        onlast = false;
      }
      if (ins_point === -1) {
        round_players.push(this.players[i]);
      }
      else {
        round_players.splice(ins_point, 0, this.players[i]);
      }
      ins_point = onlast ? -1 : ins_point + 1;
    }
    return round_players;
  }

  round_players_by_player(player) {
    // player = "Luigi"
    const ix = this.players.indexOf(player)
    if (ix < 0) {
      throw (new Error(`Player not found, ${player}`))
    }
    this.round_players_by_player_ix(ix)
  }

  round_players_by_player_ix(ix) {
    this.round_players = this.calc_round_players(ix)
  }
}
