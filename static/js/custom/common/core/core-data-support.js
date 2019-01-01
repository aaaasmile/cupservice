import { MatchInfo } from '../match-info.js'

//////////////////////////////////////////
//////////////////////////////// CoreDataSupport
//////////////////////////////////////////
export class CoreDataSupport {
  constructor() {
    this.segni_curr_match = { // TODO: questo è un mix tra match e segno!!! points_curr_segno deve avere lo stato e il score
      score: new Map(), 
      segno_state: '' ,
      bestpoints_info: {},
      is_started(){
        return this.segno_state === 'Started'
      },
      set_draw(){
        this.segno_state = 'draw'
      },
      set_end(){
        this.segno_state = 'end'
      },
      set_started(){
        this.segno_state = 'Started'
        this.bestpoints_info = {}
      },
      set_giocata_end_score(info){
        this.bestpoints_info = info
      }
    };
    this.match_state = '';
    this.match_info = new MatchInfo();
    this.players = []; // use always simple name. e.g 'Luigi'
    this.carte_prese = {};
    this.carte_in_mano = {};
    this.carte_gioc_mano_corr = [];
    this.history_mano = [];
    this.mano_count = 0;
    this.first_player_ix = 0;
    this.round_players = [];
    this.points_curr_segno = new Map(); // NOTA: Map usa SEMPRE get e set. this.points_curr_segno[key] è un'altra property che non viene inclusa in entries()
    this.mazzo_gioco = [];
    this.num_of_cards_onhandplayer = 3;
    this.player_on_turn = null;
  }

  start(num_of_players, players, hand_player_size) {
    // players: ["Luigi", "Ernesto"]
    this.match_state = 'Started';
    this.match_info.start();
    this.players = [];
    if (hand_player_size === undefined) {
      throw (new Error('hand_player_size is undefined'));
    }

    this.num_of_cards_onhandplayer = hand_player_size;
    for (let i = 0; i < num_of_players; i++) {
      let player = players[i];
      this.players.push(player);
      this.segni_curr_match.score.set(player, 0);
    }
  }

  start_new_giocata(first_ix, cards) {
    this.segni_curr_match.set_started();
    this.carte_prese = {};
    this.carte_in_mano = {}; //{'Luigi': ['_Ab','_7c']} // TODO: use a Map
    this.carte_gioc_mano_corr = [];
    this.history_mano = [];
    this.mano_count = 0;
    this.first_player_ix = first_ix;
    this.round_players = this.calc_round_players(first_ix);
    console.log('First player to play is ' + this.round_players[0] + ' with index ' + this.first_player_ix);
    console.log('Number of round_players is ' + this.round_players.length + ' players size is ' + this.players.length);
    for (let i = 0; i < this.round_players.length; i++) {
      let player = this.round_players[i];
      console.log('On this game play the player: ' + this.round_players[i]);
      this.points_curr_segno.set(player,0);
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
    let new_val = this.points_curr_segno.get(player) + points
    this.points_curr_segno.set(player, new_val)
   
    console.log('Punteggio attuale: ', this.points_curr_segno);
  }

  switch_player_on_turn() {
    this.player_on_turn = this.round_players.length > 0 ? this.round_players[0] : null;
    return this.player_on_turn;
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
    // palyer = "Luigi"
    let ix = this.players.indexOf(player)
    if (ix < 0) {
      throw (new Error(`Player not found, ${player}`))
    }
    this.round_players = this.calc_round_players(ix)
  }
}
