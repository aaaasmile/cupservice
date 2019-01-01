import { DeckInfo } from './common/deckinfo.js'
import { CoreStateManager } from './common/core-state-manager.js'
import { RndMgr } from './common/rnd-mgr.js'
import { CoreDataSupport } from './common/core-data-support.js'

// A me servono gli oggetti esportati nei moduli anche nelle librerie stadard, come ad esempio gli spec
// di jasmine, che viene usata direttamente. In queste spec, non si può usare import, allora metto
// gli oggetti che mi servono in cup. cup funzionana da namespace e lo metto in windows.cup, che non avviene di 
// default, ma lo devo fare eplicitamente in SpecRunner.html.

export const cup = {
  DeckInfo: DeckInfo,
  CoreStateManager: CoreStateManager,
  RndMgr: RndMgr,
  CoreDataSupport: CoreDataSupport,
};
//(function () { // intellisense in vscode non funziona se metto pattern per isolare oggetti privati. Gli oggetti privati hanno la lettera iniziale minuscola
// Per avere poi l'intellisense anche nei miei fiels di spec (unit test di jasmine) ho messo la dir di test come sottodirectory di questa.


//////////////////////////////////////////
//////////////////////////////// StateHandlerCaller
//////////////////////////////////////////
// Questa classe serve per chiamare le funzioni degli stati all'interno del processor
// Un processor è per esempio CoreBriscolaBase o TableStateCore
// Le funzioni chiamate sono del tipo st_mano_end e vengono chiamate direttamente tramite apply
cup.StateHandlerCaller = class StateHandlerCaller {
  constructor(processor, opt) {
    this._processor = processor //CoreBriscolaBase o TableStateCore
    this.opt = opt
  }

  call(event, name_hand, args) {
    if (this._processor[name_hand] != null) {
      //console.log(args,args instanceof Array);
      if (!(args instanceof Array)) {
        args = [args];
      }
      this._processor[name_hand].apply(this._processor, args);
    } else if (this.opt.log_missed || this.opt.log_all) {
      if (!this._processor.ignore_sate(name_hand)) {
        console.warn(`${event} ignored because handler ${name_hand} is missed. Object is `, this._processor);
      }
    }
  }
}

//////////////////////////////////////////
//////////////////////////////// CoreStateSubjectSubscriber
//////////////////////////////////////////
// Serve per gestire eventi del tipo act_XXX che sono actions.
// Questi action handler sono del tipo act_player_sit_down e si trovano normalmente
// implementate nel core tipo CoreBriscolaBase. 
// In principio un evento nel Subject dell'oggetto CoreStateManager viene lanciato.
// In questa classe viene ricevuto quest'evento e chiamato automaticamante la funzione handler
// del core.
cup.CoreStateSubjectSubscriber = class CoreStateSubjectSubscriber {

  constructor(coreStateManager, processor, opt) {
    this.opt = opt || { log_missed: false, log_all: false }
    this._coreStateManager = coreStateManager;
    this._stateHandlerCaller = new cup.StateHandlerCaller(processor, opt)
    this._subscription = coreStateManager.get_subject_state_action()
      .subscribe(next => {
        try {
          if (opt.log_all) { console.log(next); }
          let name_hand = next.name;
          if (next.is_action) {
            name_hand = 'act_' + name_hand;
          }
          this._stateHandlerCaller.call(next.name, name_hand, next.args_arr);
        } catch (e) {
          console.error(e);
          //throw(e)
        }
      });
  }

  dispose() {
    if (this._subscription != null) {
      this._subscription.unsubscribe();
      this._subscription = null;
    }
  }

}

//////////////////////////////////////////
//////////////////////////////// CoreStateStore
//////////////////////////////////////////

cup.CoreStateStore = class CoreStateStore {
  constructor() {
    this._internal_state = '';
  }

  set_state(state_name) {
    console.log(state_name);
    this._internal_state = state_name;
  }

  check_state(state_name) {
    if (this._internal_state !== state_name) {
      throw (new Error('Event expected in state ' + state_name + ' but now is ' + this._internal_state));
    }
  }
  get_internal_state() {
    return this._internal_state
  }
}

//////////////////////////////////////////
//////////////////////////////// Player
//////////////////////////////////////////
cup.Player = class Player {
  constructor(name) {
    this.Name = "Utente" + this.getUserId();
    if (name != null) { this.Name = name; }
    this.Position = 0
  }

  getUserId() {
    return String(Math.random() * 999);
  }
}

//////////////////////////////////////////
//////////////////////////////// PlayerActor
//////////////////////////////////////////
cup.PlayerActor = class PlayerActor {
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

//////////////////////////////////////////
//////////////////////////////// ActorStateSubjectSubscriber
//////////////////////////////////////////

cup.ActorStateSubjectSubscriber = class ActorStateSubjectSubscriber {

  constructor(coreStateManager, processor, opt, player_name) {
    this.opt = opt || { log_missed: false, log_all: false }
    this._coreStateManager = coreStateManager;
    this._stateHandlerCaller = new cup.StateHandlerCaller(processor, opt)
    this._playerSubject = null;
    this._subscription = coreStateManager.get_subject_for_all_players()
      .subscribe(next => {
        try {
          if (opt.log_all) { console.log(next); }
          let name_hand = 'on_all_' + next.event;
          this._stateHandlerCaller.call(next.event, name_hand, next.args);
        } catch (e) {
          console.error(e);
        }
      });
    this._playerSubject = this._coreStateManager.get_subject_for_player(player_name)
      .subscribe(next => {
        try {
          if (this.opt.log_all) { console.log(next); }
          let name_hand = 'on_pl_' + next.event;
          this._stateHandlerCaller.call(next.event, name_hand, next.args);
        } catch (e) {
          console.error(e);
        }
      });
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

//////////////////////////////////////////
//////////////////////////////// TableStateCore
//////////////////////////////////////////
cup.TableStateCore = class TableStateCore {

  constructor(coreStateManager, numOfPlayers) {
    this._coreStateManager = coreStateManager
    this._currNumPlayers = 0
    this._numOfPlayers = numOfPlayers
    this._players = [];
    this._coreStateStore = new cup.CoreStateStore()
    this.TableFullSub = new rxjs.Subject();
    let that = this;
    this._subscriber = new cup.CoreStateSubjectSubscriber(coreStateManager, that, { log_missed: false });
    this._coreStateManager.submit_next_state('st_waiting_for_players');
  }

  ignore_sate(state) {
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
    this.TableFullSub.next({ players: this._players })
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


///////////////////////////////////////////////////////////////////////////////////////
/// BRISCOLA in DUE
///////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////
//////////////////////////////// CoreBriscolaBase
//////////////////////////////////////////
cup.CoreBriscolaBase = class CoreBriscolaBase {
  constructor(_coreStateManager, _numOfSegni, _pointsForWin) {
    this._coreStateStore = new cup.CoreStateStore()
    this._myOpt = {
      tot_num_players: 2, num_segni_match: 2
      , target_points_segno: 61, players: [], num_cards_onhand: 3
      , predef_deck: [], predef_ix: -1
    };
    this._coreStateManager = _coreStateManager
    this._numOfSegni = _numOfSegni
    this._pointsForWin = _pointsForWin
    this._deck_info = new DeckInfo();
    this._core_data = new cup.CoreDataSupport();
    this._briscola_in_tav_lbl = '';
    let that = this;
    this._subscriber = new cup.CoreStateSubjectSubscriber(_coreStateManager, that, { log_missed: true });
    this._deck_info.deck_info_dabriscola();
    this._rnd_mgr = new cup.RndMgr()
  }

  StartNewMatch(options) {
    console.log("Start a new match");
    this._myOpt = options || {}
    this._myOpt.predef_deck = this._myOpt.predef_deck || [];
    this._myOpt.predef_ix = this._myOpt.predef_ix || -1;
    this._myOpt.tot_num_players = this._myOpt.tot_num_players || 2;
    this._myOpt.num_segni_match = this._myOpt.num_segni_match || this._numOfSegni;
    this._myOpt.target_points_segno = this._myOpt.target_points_segno || this._pointsForWin;
    this._myOpt.num_cards_onhand = this._myOpt.num_cards_onhand || 3;
    // var _game_core_recorder = mod_gamerepl.game_core_recorder_ctor();
    //this._rnd_mgr.set_predefined_deck(this._myOpt.predef_deck);

    this._core_data.start(this._myOpt.tot_num_players, this._myOpt.players, this._myOpt.num_cards_onhand);
    this._coreStateManager.fire_all('ev_new_match', {
      players: this._core_data.players
      , num_segni: this._myOpt.num_segni_match, target_segno: this._myOpt.target_points_segno
    });
    this._coreStateManager.submit_next_state('st_new_giocata');
  }

  ignore_sate(state) {
    let ignored = ['st_waiting_for_players', 'st_table_partial', 'st_table_full']
    return ignored.indexOf(state) >= 0
  }

  act_player_sit_down(name, pos) { }

  act_alg_play_acard(player_name, lbl_card) {
    this._coreStateStore.check_state('st_wait_for_play');
    console.log('Player ' + player_name + ' played ' + lbl_card);
    if (this._core_data.player_on_turn !== player_name) {
      console.warn('Player ' + player_name + ' not allowed to play now');
      return;
    }
    let cards = this._core_data.carte_in_mano[player_name];
    let pos = cards.indexOf(lbl_card);
    let data_card_gioc = { player_name: player_name, card_played: lbl_card };
    if (pos !== -1) {
      //_game_core_recorder.store_player_action(player.name, 'cardplayed', player.name, lbl_card);
      let old_size = this._core_data.carte_in_mano[player_name].length;
      this._core_data.carte_in_mano[player_name].splice(pos, 1);
      console.log('++' + this._core_data.mano_count + ',' + this._core_data.carte_gioc_mano_corr.length +
        ',Card ' + lbl_card + ' played from player ' + player_name);
      this._core_data.carte_gioc_mano_corr.push({ lbl_card: lbl_card, player: player_name });
      this._coreStateManager.fire_all('ev_player_has_played', { cards_played: data_card_gioc });
      this._core_data.round_players.splice(0, 1);
      //console.log('_carte_in_mano ' + player_name + ' size is ' + this._core_data.carte_in_mano[player.name].length + ' _round_players size is ' + this._core_data.round_players.length);
      //console.log('*** new size is ' + this._core_data.carte_in_mano[player.name].length + ' old size is ' + old_size);
      this._coreStateManager.submit_next_state('st_continua_mano');
    } else {
      console.warn('Card ' + lbl_card + ' not allowed to be played from player ' + player_name);
      this._coreStateManager.fire_to_player(player_name, 'ev_player_cardnot_allowed', { hand_player: cards, wrong_card: lbl_card });
    }
  }

  st_new_giocata() {
    this._coreStateStore.set_state('st_new_giocata');
    let cards = this._deck_info.get_cards_on_game();
    cards = this._rnd_mgr.get_deck(cards);
    let first_player_ix = this._rnd_mgr.get_first_player(this._core_data.players.length);
    this._core_data.start_new_giocata(first_player_ix, cards);
    this.distribute_cards();
    this._core_data.players.forEach(player => {
      let data_newgioc = {
        carte: this._core_data.carte_in_mano[player]
        , brisc: this._briscola_in_tav_lbl
      };
      this._coreStateManager.fire_to_player(player, 'ev_brisc_new_giocata', data_newgioc);
    });
    this._coreStateManager.submit_next_state('st_new_mano');
  }

  st_new_mano() {
    this._coreStateStore.set_state('st_new_mano');
    this._coreStateManager.fire_all('ev_new_mano', { mano_count: this._core_data.mano_count });
    this._coreStateManager.submit_next_state('st_continua_mano');
  }

  st_continua_mano() {
    this._coreStateStore.set_state('st_continua_mano');
    let player = this._core_data.switch_player_on_turn();
    if (player) {
      console.log('Player on turn: ' + player);
      this._coreStateManager.fire_all('ev_have_to_play', { player_on_turn: player });
      this._coreStateManager.submit_next_state('st_wait_for_play');
    } else {
      this._coreStateManager.submit_next_state('st_mano_end');
    }
  }

  st_wait_for_play() {
    this._coreStateStore.set_state('st_wait_for_play');
  }

  st_mano_end() {
    this._coreStateStore.set_state('st_mano_end');
    let wininfo = this.vincitore_mano(this._core_data.carte_gioc_mano_corr) //wininfo is {lbl_best: '_5c', player_best: 'Luigi'}
    console.log('Mano vinta da ', wininfo.player_best)
    this._core_data.mano_count += 1

    let carte_prese_mano = []
    this._core_data.carte_gioc_mano_corr.forEach(hash_card => { //hash_card is { lbl_card: lbl_card, player: player_name }
      this._core_data.carte_prese[wininfo.player_best].push(hash_card.lbl_card)
      carte_prese_mano.push(hash_card.lbl_card)
    })

    this._core_data.round_players_by_player(wininfo.player_best)
    let punti_presi = this.calc_punteggio(carte_prese_mano);


    throw ("TODO da def mano_end...")
  }

  calc_punteggio(carte_prese_mano) {
    // carte_prese_mano = ['_Ab', '_4s']
    let punti = 0, card_info;
    carte_prese_mano.forEach((card_lbl) => {
      card_info = this._deck_info.get_card_info(card_lbl);
      punti += card_info.points;
    });
    return punti;
  }

  vincitore_mano(carte_giocate) {
    let res = {
      lbl_best: null,
      player_best: null
    }
    carte_giocate.forEach(card_gioc => {
      // card_gioc: { lbl_card: lbl_card, player: player_name }
      let lbl_curr = card_gioc.lbl_card
      let player_curr = card_gioc.player
      if (!res.lbl_best) {
        res.lbl_best = lbl_curr
        res.player_best = player_curr
        return
      }
      let info_cardhash_best = this._deck_info.get_card_info(res.lbl_best)
      let info_cardhash_curr = this._deck_info.get_card_info(lbl_curr)
      if (this.is_briscola(lbl_curr) && !this.is_briscola(res.lbl_best)) {
        res.lbl_best = lbl_curr
        res.player_best = player_curr
      } else if (!this.is_briscola(lbl_curr) && this.is_briscola(res.lbl_best)) {
        // nothing to do
      } else {
        if (info_cardhash_curr.segno === info_cardhash_best.segno) {
          if (info_cardhash_curr.rank > info_cardhash_best.rank) {
            res.lbl_best = lbl_curr
            res.player_best = player_curr
          }
        }
      }
    })

    return res
  }

  is_briscola(lbl_card) {
    let card_info = this._deck_info.get_card_info(lbl_card)
    let card_info_briscola = this._deck_info.get_card_info(this._briscola_in_tav_lbl)
    let segno_card = card_info.segno
    let segno_brisc = card_info_briscola.segno
    return (segno_brisc === segno_card)
  }

  distribute_cards() {
    for (let i = 0; i < this._core_data.round_players.length; i++) {
      let player = this._core_data.round_players[i];
      let carte_player = [];
      for (let j = 0; j < this._core_data.num_of_cards_onhandplayer; j++) {
        carte_player.push(this._core_data.mazzo_gioco.pop());
      }
      this._core_data.carte_in_mano[player] = carte_player;
      this._core_data.carte_prese[player] = [];
      this._core_data.points_curr_segno[player] = 0;
      //console.log(this._core_data.carte_in_mano,carte_player,this._core_data.num_of_cards_onhandplayer);
    }
    this._briscola_in_tav_lbl = this._core_data.mazzo_gioco.pop();
  }

  dispose() {
    if (this._subscriber != null) {
      this._subscriber.dispose();
      this._subscriber = null;
    }
  }
}


//////////////////////////////////////////
//////////////////////////////// AlgBriscBase
//////////////////////////////////////////
cup.AlgBriscBase = class AlgBriscBase {


  constructor(_playerActor) {
    this._playerActor = _playerActor
    this._deck_info = new DeckInfo();
    this._points_segno = {};
    this._opp_names = [];
    this._team_mates = [];
    this._players = [];
    this._level_alg = 'dummy';
    this._strozzi_on_suite = {};
    this._num_cards_on_deck = 0;
    this._target_points = 61;
    this._num_cards_on_player_hand = 3;
    this._deck_size = 40;
    this._num_brisc_intavola = 1;
    this._max_numcards_ondeck = 33;
    this._cards_on_hand = [];
    this._briscola = undefined;
    this._card_played = [];
    this._options = {
      use_delay_before_play: false,
      timeout_haveplay: 300
    };
    this._player_name = _playerActor.Player.Name;
    let that = this;
    // _actorNotifier: serve per ricevere gli eventi del core in un handler automatico
    // del tipo on_all_xxx e gli eventi on_pl_xxx
    this._actorNotifier = new cup.ActorStateSubjectSubscriber(
      _playerActor.getCoreStateManager(),
      that, { log_all: false, log_missed: true },
      _playerActor.Player.Name);

  }

  on_all_ev_new_match(args) {
    //console.log("[%s]New match %s", this._player_name, JSON.stringify(args));
    this._players = args.players;
    this._target_points = args.target_segno;
    console.log("[%s] New match, " + this._player_name + '  is playing level ' + this._level_alg + ' ( game with ' + this._players.length + ' players)', this._player_name);
    this._opp_names = [];
    this._team_mates = [];
    this._points_segno = {};
    let ix_me = 0;
    for (let i = 0; i < this._players.length; i++) {
      let pl = this._players[i];
      if (pl === this._player_name) {
        ix_me = i;
        break;
      }
    }
    for (let i = 0; i < this._players.length; i++) {
      let pl = this._players[i];
      this._points_segno[pl] = 0;
      if (this.is_opponent(i, ix_me)) {
        this._opp_names.push(pl);
      }
      else {
        this._team_mates.push(pl);
      }
    }
  }

  on_pl_ev_brisc_new_giocata(args) {
    console.log("[%s] New giorcata " + JSON.stringify(args), this._player_name);
    let str_card = '';
    ["b", "d", "s", "c"].forEach(segno => {
      this._strozzi_on_suite[segno] = 2;
    });
    this._num_cards_on_deck = this._deck_size - this._num_cards_on_player_hand * this._players.length - this._num_brisc_intavola;
    this.assign_cards_on_hand(args.carte);
    this._briscola = args.brisc;
    this._players.forEach(pl => {
      this._points_segno[pl] = 0;
    });
  }

  on_all_ev_new_mano(args) {
    console.log("[%s] New mano " + JSON.stringify(args), this._player_name);
    this._card_played = [];
  }

  on_all_ev_have_to_play(args) {
    console.log("[%s] Have to play " + JSON.stringify(args), this._player_name);
    if (args.player_on_turn === this._player_name) {
      console.log("[%s] Play a card please", this._player_name);
      if (this._options.use_delay_before_play) {
        console.log("[%s] Delay before play ms: " + this._options.timeout_haveplay, this._player_name);
        setTimeout(x => this.alg_play_acard(), this._options.timeout_haveplay);
      } else {
        this.alg_play_acard();
      }
    }
  }

  on_all_ev_player_has_played(args) {
    //args = {"cards_played":{"player_name":"Luigi","card_played":"_5c"}}
    console.log("[%s] Player has played " + JSON.stringify(args), this._player_name);
    const card = args.cards_played.card_played
    if (args.cards_played.player_name === this._player_name) {
      this._cards_on_hand = this._cards_on_hand.filter(x => x !== card)
    } else {
      this._card_played.push(card)
    }
    const segno = card[2]
    if (card[1] === 'A' || card[1] === '3') {
      this._strozzi_on_suite[segno] -= 1
    }
  }

  assign_cards_on_hand(cards) {
    this._cards_on_hand = [];
    cards.forEach(card => {
      this._cards_on_hand.push(card);
    });
  }

  is_opponent(index, ix_me) {
    if (ix_me === 0 || ix_me === 2) {
      if (index === 1 || index === 3) {
        return true;
      } else {
        return false;
      }
    } else {
      if (index === 0 || index === 2) {
        return true;
      } else {
        return false;
      }
    }
  }

  alg_play_acard() {
    console.log("[%s] alg on play: " + this._player_name + ', cards N: ' + this._cards_on_hand.length + ' hand ' + this._cards_on_hand, this._player_name);
    let card = undefined;
    switch (this._level_alg) {
      case 'master':
        card = this.play_like_a_master();
        break;
      case 'predefined':
        //card = _prot.play_from_predef_stack();
        break;
      default:
        card = this.play_like_a_dummy();
        break;
    }
    if (card) {
      console.log("[%s] Want to play the card " + card, this._player_name);
      this._playerActor.play_card(card);
    } else if (this._level_alg !== 'predefined') {
      throw (new Error('alg_play_acard: Card to be played not found'));
    } else {
      console.log('Unable to play beacuse no card is suggested');
    }
  }

  play_like_a_master() {
    let card = 'Error';
    switch (this._card_played.length) {
      case 0:
        card = this.play_as_master_first();
        break;
      case 1:
        card = this.play_as_master_second();
        break;
      default:
        throw (new Error('play_like_a_master: not know what to do'));
    }
    return card;
  }

  play_as_master_first() {
    let w_cards = [], segno, card_s, curr_w, lisc_val;
    let min_item;
    this._cards_on_hand.forEach(card_lbl => {
      card_s = card_lbl;
      segno = card_s[2];
      curr_w = 0;
      if (card_s[2] === this._briscola[2]) { curr_w += 70; }
      // check if it is an ass or 3
      if (card_s[1] === 'A') { curr_w += 220; }
      if (card_s[1] === '3') { curr_w += 200; }
      if (card_s[1].match(/[24567]/)) {
        // liscio value
        lisc_val = parseInt(card_s[1], 10);
        curr_w += 70 + lisc_val;
      }
      if (card_s[1] === 'F') { curr_w += 60; }
      if (card_s[1] === 'C') { curr_w += 30; }
      if (card_s[1] === 'R') { curr_w += 20; }
      // penalty for cards wich are not catch free, for example a 3
      curr_w += 25 * this._strozzi_on_suite[segno];
      if (this._num_cards_on_deck === 1) {
        // last hand before deck empty
        // if briscola is big we play a big card
        if (card_s[2] === this._briscola[2]) { curr_w += 60; }
        if (this._briscola[1] === 'A' || this._briscola[1] === '3') {
          if (card_s[1] === 'A') { curr_w -= 220; }
          if (card_s[1] === '3') { curr_w -= 200; }
        } else if (this._briscola[1] === 'F' || this._briscola[1] === 'C' || this._briscola[1] === 'R') {
          if (card_s[1] === 'A') { curr_w -= 180; }
          if (card_s[1] === '3' && this._strozzi_on_suite[segno] === 1) { curr_w -= 160; }
        }
      }
      w_cards.push([card_lbl, curr_w]);
    }); // end weight
    // find a minimum
    min_item = Helper.MinOnWeightItem1(w_cards);
    console.log("[%s] " + 'Play as first: best card ' + min_item[0] + ' (w_cards = ' + w_cards + ')', this._player_name);
    return min_item[0];
  }

  play_as_master_second() {
    let card_avv_s, card_avv_info, max_points_take = 0, max_card_take;
    let min_card_leave, min_points_leave = 120, take_it = [], leave_it = [];
    let card_s, bcurr_card_take, card_curr_info, points;
    let curr_points_me, tot_points_if_take, curr_points_opp, max_card_take_s;
    let card_best_taken_s;

    card_avv_s = this._card_played[0];
    card_avv_info = this._deck_info.get_card_info(this._card_played[0]);
    max_card_take = this._cards_on_hand[0];
    min_card_leave = this._cards_on_hand[0];
    // build takeit leaveit arrays and store max take and min leave
    this._cards_on_hand.forEach(card_lbl => {
      card_s = card_lbl;
      bcurr_card_take = false;
      card_curr_info = this._deck_info.get_card_info(card_lbl);
      if (card_s[2] === card_avv_s[2]) {
        //same suit
        if (card_curr_info.rank > card_avv_info.rank) {
          // current card take
          bcurr_card_take = true;
          take_it.push(card_lbl);
        } else {
          leave_it.push(card_lbl);
        }
      } else if (card_s[2] === this._briscola[2]) {
        // this card is a briscola
        bcurr_card_take = true;
        take_it.push(card_lbl);
      } else {
        leave_it.push(card_lbl);
      }
      // check how many points make the card if it take
      points = card_curr_info.points + card_avv_info.points;
      if (bcurr_card_take && points > max_points_take) {
        max_card_take = card_lbl;
        max_points_take = points;
      }
      // or it leave
      if (!bcurr_card_take && points < min_points_leave) {
        min_card_leave = card_lbl;
        min_points_leave = points;
      }
    });

    curr_points_me = 0;
    this._team_mates.forEach(name_pl => { curr_points_me += this._points_segno[name_pl]; });
    tot_points_if_take = curr_points_me + max_points_take;
    curr_points_opp = 0;
    this._opp_names.forEach(name_pl => { curr_points_opp += this._points_segno[name_pl]; });

    console.log('play_as_master_second, cards ' + this._cards_on_hand);
    if (take_it.length === 0) {
      //take_it is not possibile, use leave it
      console.log("play_as_master_second, apply R1")
      return min_card_leave;
    }
    if (tot_points_if_take > this._target_points) {
      console.log("play_as_master_second, apply R2");
      return max_card_take;
    }
    max_card_take_s = max_card_take;
    if (max_card_take_s[2] === this._briscola[2]) {
      // card that take is briscola, pay attention to play it
      if (max_points_take >= 20) {
        console.log("play_as_master_second, apply R3");
        return max_card_take;
      }
    } else if (max_points_take >= 10 && this._num_cards_on_deck > 1) {
      // take it because strosa
      console.log("play_as_master_second, apply R4");
      return max_card_take;
    }
    if (min_points_leave === 0) {
      // don't lose any points, leave it
      console.log("play_as_master_second, apply R10");
      return min_card_leave;
    }
    if (this._num_cards_on_deck === 1) {
      // last hand before deck empty
      // if briscola is big we play a big card
      if (this._briscola[1] === 'A' || this._briscola[1] === '3') {
        if (leave_it.length > 0) {
          console.log("play_as_master_second, apply R9");
          return min_card_leave;
        } else {
          // incartato
          console.log("play_as_master_second, apply R9a");
          return max_card_take;
        }
      } else if (this._briscola[1] === 'R' || this._briscola[1] === 'C' || this._briscola[1] === 'F') {
        if (min_points_leave <= 4) {
          console.log("play_as_master_second, apply R8");
          return min_card_leave;
        }
      }
    }
    if (take_it.length > 0) {
      // we can take it
      if (curr_points_opp > 40 && max_points_take > 0) {
        console.log("play_as_master_second, apply R5");
        return this.best_taken_card(take_it);
      }
      if (min_points_leave > 3 && take_it.length > 1) {
        // leave-it lose points and I have at least two cards for taken -> take it.
        console.log("play_as_master_second, apply R6");
        return this.best_taken_card(take_it);
      }
      if (min_points_leave > 5) {
        card_best_taken_s = this.best_taken_card(take_it);
        if (card_best_taken_s[2] === this._briscola[2]) {
          // best card is a briscola
          if (min_points_leave <= 8 && curr_points_opp < 53
            && (card_best_taken_s[1] === 'A' || card_best_taken_s[1] === '3')) {
            // taken with A or 3 is too much forced
            console.log("play_as_master_second, apply R12");
            return min_card_leave;
          }
        }
        // leave-it loose to many points
        console.log("play_as_master_second, apply R11");
        return card_best_taken_s;
      }
      card_best_taken_s = this.best_taken_card(take_it);
      if (card_best_taken_s[2] !== this._briscola[2]
        && !card_s[1].match(/[24567]/)) {
        // make points without briscola
        console.log("play_as_master_second, apply R13");
        return card_best_taken_s;
      }
    }
    // at this point we can only leave-it
    console.log("play_as_master_second, apply R7");
    return min_card_leave;
  }

  best_taken_card(take_it) {
    let w_cards = [], card_s, segno, curr_w, lisc_val, min_item;
    console.log("calculate best_taken_card");
    take_it.forEach(card_lbl => {
      card_s = card_lbl;
      segno = card_s[2];
      curr_w = 0;
      // check if it is an asso or 3
      if (card_s[1] === 'A') {
        curr_w += 9;
        if (card_s[2] === this._briscola[2]) { curr_w += 200; }
      }
      if (card_s[1] === '3') {
        curr_w += 7;
        if (card_s[2] === this._briscola[2]) { curr_w += 170; }
      }
      if (card_s[1].match(/[24567]/)) {
        lisc_val = parseInt(card_s[1], 10);
        curr_w += 70 + lisc_val;
        if (card_s[2] === this._briscola[2]) { curr_w += 80; }
      }
      if (card_s[1] === 'F') {
        curr_w += 40;
        if (card_s[2] === this._briscola[2]) { curr_w += 130; }
      }
      if (card_s[1] === 'C') {
        curr_w += 30;
        if (card_s[2] === this._briscola[2]) { curr_w += 140; }
      }
      if (card_s[1] === 'R') {
        curr_w += 20;
        if (card_s[2] === this._briscola[2]) { curr_w += 150; }
      }
      w_cards.push([card_lbl, curr_w]);
    });
    min_item = Helper.MinOnWeightItem1(w_cards);
    console.log("[%s] " + 'Best card to play on best_taken_card is' + min_item[0] + ' w_cards = ' + w_cards, this._player_name);
    return min_item[0];
  }

  play_like_a_dummy() {
    let ix = Math.floor(Math.random() * this._cards_on_hand.length);
    ix = ix >= this._cards_on_hand.length ? this._cards_on_hand.length - 1 : ix;
    if (ix < 0) {
      throw (new Error('Player hand is empty, impossible to play a card'));
    }
    return this._cards_on_hand[ix];
  }

}


//})();
