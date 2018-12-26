/* functions that need to be exported in cup namespace*/
(function () {

  
  

  // ----------- CoreSubjectNtfy ---
  export class SubjectNtfy {
    _subscription;
    constructor(_processor, opt) { }

    process_next(event, name_hand, args) {
      if (this._processor[name_hand] != null) {
        //console.log(args,args instanceof Array);
        if (!(args instanceof Array)) {
          args = [args];
        }
        this._processor[name_hand].apply(this._processor, args);
      } else if (this.opt.log_missed || this.opt.log_all) {
        console.log("%s ignored because handler %s is missed", event, name_hand);
      }
    }

    dispose() {
      if (this._subscription != null) {
        this._subscription.unsubscribe();
        this._subscription = null;
      }
    }
  }

  export class CoreSubjectNtfy extends SubjectNtfy {

    constructor(_core, _processor, opt) {
      super(_processor, opt || { log_missed: false, log_all: false });
      this._subscription = _core.get_subject_state_action().subscribe(next => {
        try {
          if (opt.log_all) { console.log(next); }
          let name_hand = next.name;
          if (next.is_action) {
            name_hand = 'act_' + name_hand;
          }
          this.process_next(next.name, name_hand, next.args_arr);
        } catch (e) {
          console.error(e);
        }

      });
    }
  }

  export class CoreGameBase {
    _internal_state;
    set_state(state_name) {
      console.log(state_name);
      this._internal_state = state_name;
    }

    check_state(state_name) {
      if (this._internal_state !== state_name) {
        throw (new Error('Event expected in state ' + state_name + ' but now is ' + this._internal_state));
      }
    }
  }

  // -- Private section --

  

  

  // ----------- Player -------------
  export class Player {
    Name = "Utente" + this.getUserId();
    Position = 0;

    constructor(name) {
      if (name != null) { this.Name = name; }
    }

    getUserId() {
      return String(Math.random() * 999);
    }
  }

  // ----------- PlayerActor -------------
  export class PlayerActor {
    Player;
    constructor(pl, _coreActor) {
      this.Player = pl;
    }

    sit_down(pos) {
      this._coreActor.submit_action('player_sit_down', [this.Player.Name, pos]);
    }

    play_card(card) {
      this._coreActor.submit_action('alg_play_acard', [this.Player.Name, card])
    }

    getCore() { return this._coreActor; }
  }

  // ----------- ActorSubjectNtfy -------------
  export class ActorSubjectNtfy extends SubjectNtfy {
    _playerSubject;

    constructor(_core, _processor, opt) {
      super(_processor, opt || { log_missed: false, log_all: false });
      this._subscription = _core.get_subject_for_all_players().subscribe(next => {
        try {
          if (opt.log_all) { console.log(next); }
          let name_hand = 'on_all_' + next.event;
          this.process_next(next.event, name_hand, next.args);
        } catch (e) {
          console.error(e);
        }
      });
    }

    subscribePlayer(player_name) {
      this._playerSubject = this._core.get_subject_for_player(player_name).subscribe(next => {
        try {
          if (this.opt.log_all) { console.log(next); }
          let name_hand = 'on_pl_' + next.event;
          this.process_next(next.event, name_hand, next.args);
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
      super.dispose();
    }
  }

  export class TableStateCore {
    _currNumPlayers;
    TableFullSub = new Subject();
    _players = [];
    _notifyer;

    constructor(_core, _numOfPlayers) {
      let that = this;
      this._notifyer = new CoreSubjectNtfy(_core, that, { log_missed: false });
      this._currNumPlayers = 0;
      _core.submit_next_state('st_waiting_for_players');
    }

    st_waiting_for_players() {
      console.log('Waiting for players');
    }

    st_table_partial() {
      console.log('Table is filling');
    }

    st_table_full() {
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
        this._core.submit_next_state('st_table_full');
      } else {
        this._core.submit_next_state('st_table_partial');
      }
    }

    dispose() {
      if (this._notifyer != null) {
        this._notifyer.dispose();
        this._notifyer = null;
      }
    }

  }

  export class DeckInfoItem {
    ix;
    nome;
    symb;
    segno;
    seed_ix;
    pos;
    rank;
    points;
  }

  class IDeckInfo40 {
    _Ab;
    _2b;
    _3b;
    _4b;
    _5b;
    _6b;
    _7b;
    _Fb;
    _Cb;
    _Rb;
    _Ac;
    _2c;
    _3c;
    _4c;
    _5c;
    _6c;
    _7c;
    _Fc;
    _Cc;
    _Rc;
    _Ad;
    _2d;
    _3d;
    _4d;
    _5d;
    _6d;
    _7d;
    _Fd;
    _Cd;
    _Rd;
    _As;
    _2s;
    _3s;
    _4s;
    _5s;
    _6s;
    _7s;
    _Fs;
    _Cs;
    _Rs;
  }

  class IDeckInfo52 extends IDeckInfo40 {
    _8b;
    _9b;
    _db;
    _8c;
    _9c;
    _dc;
    _8d;
    _9d;
    _dd;
    _8s;
    _9s;
    _ds;
  }

  export class DeckInfo {

    deck_info_det52 = new IDeckInfo52()
    deck_info_det = new IDeckInfo40()
    use_52deck = false

    cards_on_game = [
      '_Ab', '_2b', '_3b', '_4b', '_5b', '_6b', '_7b', '_Fb', '_Cb', '_Rb',
      '_Ac', '_2c', '_3c', '_4c', '_5c', '_6c', '_7c', '_Fc', '_Cc', '_Rc',
      '_Ad', '_2d', '_3d', '_4d', '_5d', '_6d', '_7d', '_Fd', '_Cd', '_Rd',
      '_As', '_2s', '_3s', '_4s', '_5s', '_6s', '_7s', '_Fs', '_Cs', '_Rs'];

    constructor() {
      this.setToDeck40()
    }

    setToDeck40() {
      this.use_52deck = false
      this.deck_info_det._Ab = { ix: 0, nome: 'asso bastoni', symb: 'asso', segno: 'B', seed_ix: 0, pos: 1, points: 0, rank: 0 }
      this.deck_info_det._2b = { ix: 1, nome: 'due bastoni', symb: 'due', segno: 'B', seed_ix: 0, pos: 2, points: 0, rank: 0 }
      this.deck_info_det._3b = { ix: 2, nome: 'tre bastoni', symb: 'tre', segno: 'B', seed_ix: 0, pos: 3, points: 0, rank: 0 }
      this.deck_info_det._4b = { ix: 3, nome: 'quattro bastoni', symb: 'qua', segno: 'B', seed_ix: 0, pos: 4, points: 0, rank: 0 }
      this.deck_info_det._5b = { ix: 4, nome: 'cinque bastoni', symb: 'cin', segno: 'B', seed_ix: 0, pos: 5, points: 0, rank: 0 }
      this.deck_info_det._6b = { ix: 5, nome: 'sei bastoni', symb: 'sei', segno: 'B', seed_ix: 0, pos: 6, points: 0, rank: 0 }
      this.deck_info_det._7b = { ix: 6, nome: 'sette bastoni', symb: 'set', segno: 'B', seed_ix: 0, pos: 7, points: 0, rank: 0 }
      this.deck_info_det._Fb = { ix: 7, nome: 'fante bastoni', symb: 'fan', segno: 'B', seed_ix: 0, pos: 8, points: 0, rank: 0 }
      this.deck_info_det._Cb = { ix: 8, nome: 'cavallo bastoni', symb: 'cav', segno: 'B', seed_ix: 0, pos: 9, points: 0, rank: 0 }
      this.deck_info_det._Rb = { ix: 9, nome: 're bastoni', symb: 're', segno: 'B', seed_ix: 0, pos: 10, points: 0, rank: 0 }
      this.deck_info_det._Ac = { ix: 10, nome: 'asso coppe', symb: 'asso', segno: 'C', seed_ix: 1, pos: 1, points: 0, rank: 0 }
      this.deck_info_det._2c = { ix: 11, nome: 'due coppe', symb: 'due', segno: 'C', seed_ix: 1, pos: 2, points: 0, rank: 0 }
      this.deck_info_det._3c = { ix: 12, nome: 'tre coppe', symb: 'tre', segno: 'C', seed_ix: 1, pos: 3, points: 0, rank: 0 }
      this.deck_info_det._4c = { ix: 13, nome: 'quattro coppe', symb: 'qua', segno: 'C', seed_ix: 1, pos: 4, points: 0, rank: 0 }
      this.deck_info_det._5c = { ix: 14, nome: 'cinque coppe', symb: 'cin', segno: 'C', seed_ix: 1, pos: 5, points: 0, rank: 0 }
      this.deck_info_det._6c = { ix: 15, nome: 'sei coppe', symb: 'sei', segno: 'C', seed_ix: 1, pos: 6, points: 0, rank: 0 }
      this.deck_info_det._7c = { ix: 16, nome: 'sette coppe', symb: 'set', segno: 'C', seed_ix: 1, pos: 7, points: 0, rank: 0 }
      this.deck_info_det._Fc = { ix: 17, nome: 'fante coppe', symb: 'fan', segno: 'C', seed_ix: 1, pos: 8, points: 0, rank: 0 }
      this.deck_info_det._Cc = { ix: 18, nome: 'cavallo coppe', symb: 'cav', segno: 'C', seed_ix: 1, pos: 9, points: 0, rank: 0 }
      this.deck_info_det._Rc = { ix: 19, nome: 're coppe', symb: 're', segno: 'C', seed_ix: 1, pos: 10, points: 0, rank: 0 }
      this.deck_info_det._Ad = { ix: 20, nome: 'asso denari', symb: 'asso', segno: 'D', seed_ix: 2, pos: 1, points: 0, rank: 0 }
      this.deck_info_det._2d = { ix: 21, nome: 'due denari', symb: 'due', segno: 'D', seed_ix: 2, pos: 2, points: 0, rank: 0 }
      this.deck_info_det._3d = { ix: 22, nome: 'tre denari', symb: 'tre', segno: 'D', seed_ix: 2, pos: 3, points: 0, rank: 0 }
      this.deck_info_det._4d = { ix: 23, nome: 'quattro denari', symb: 'qua', segno: 'D', seed_ix: 2, pos: 4, points: 0, rank: 0 }
      this.deck_info_det._5d = { ix: 24, nome: 'cinque denari', symb: 'cin', segno: 'D', seed_ix: 2, pos: 5, points: 0, rank: 0 }
      this.deck_info_det._6d = { ix: 25, nome: 'sei denari', symb: 'sei', segno: 'D', seed_ix: 2, pos: 6, points: 0, rank: 0 }
      this.deck_info_det._7d = { ix: 26, nome: 'sette denari', symb: 'set', segno: 'D', seed_ix: 2, pos: 7, points: 0, rank: 0 }
      this.deck_info_det._Fd = { ix: 27, nome: 'fante denari', symb: 'fan', segno: 'D', seed_ix: 2, pos: 8, points: 0, rank: 0 }
      this.deck_info_det._Cd = { ix: 28, nome: 'cavallo denari', symb: 'cav', segno: 'D', seed_ix: 2, pos: 9, points: 0, rank: 0 }
      this.deck_info_det._Rd = { ix: 29, nome: 're denari', symb: 're', segno: 'D', seed_ix: 2, pos: 10, points: 0, rank: 0 }
      this.deck_info_det._As = { ix: 30, nome: 'asso spade', symb: 'asso', segno: 'S', seed_ix: 3, pos: 1, points: 0, rank: 0 }
      this.deck_info_det._2s = { ix: 31, nome: 'due spade', symb: 'due', segno: 'S', seed_ix: 3, pos: 2, points: 0, rank: 0 }
      this.deck_info_det._3s = { ix: 32, nome: 'tre spade', symb: 'tre', segno: 'S', seed_ix: 3, pos: 3, points: 0, rank: 0 }
      this.deck_info_det._4s = { ix: 33, nome: 'quattro spade', symb: 'qua', segno: 'S', seed_ix: 3, pos: 4, points: 0, rank: 0 }
      this.deck_info_det._5s = { ix: 34, nome: 'cinque spade', symb: 'cin', segno: 'S', seed_ix: 3, pos: 5, points: 0, rank: 0 }
      this.deck_info_det._6s = { ix: 35, nome: 'sei spade', symb: 'sei', segno: 'S', seed_ix: 3, pos: 6, points: 0, rank: 0 }
      this.deck_info_det._7s = { ix: 36, nome: 'sette spade', symb: 'set', segno: 'S', seed_ix: 3, pos: 7, points: 0, rank: 0 }
      this.deck_info_det._Fs = { ix: 37, nome: 'fante spade', symb: 'fan', segno: 'S', seed_ix: 3, pos: 8, points: 0, rank: 0 }
      this.deck_info_det._Cs = { ix: 38, nome: 'cavallo spade', symb: 'cav', segno: 'S', seed_ix: 3, pos: 9, points: 0, rank: 0 }
      this.deck_info_det._Rs = { ix: 39, nome: 're spade', symb: 're', segno: 'S', seed_ix: 3, pos: 10, points: 0, rank: 0 }
    }


    activateThe52deck() {
      this.use_52deck = true
      this.cards_on_game = [
        '_Ab', '_2b', '_3b', '_4b', '_5b', '_6b', '_7b', '_8b', '_9b', '_10b', '_Fb', '_Cb', '_Rb',
        '_Ac', '_2c', '_3c', '_4c', '_5c', '_6c', '_7c', '_8c', '_9c', '_10c', '_Fc', '_Cc', '_Rc',
        '_Ad', '_2d', '_3d', '_4d', '_5d', '_6d', '_7d', '_8d', '_9d', '_10d', '_Fd', '_Cd', '_Rd',
        '_As', '_2s', '_3s', '_4s', '_5s', '_6s', '_7s', '_8s', '_9s', '_10s', '_Fs', '_Cs', '_Rs'];

      Object.keys(this.deck_info_det).forEach(key => this.deck_info_det52[key] = key);
      // bastoni 
      this.deck_info_det52._8b = { ix: 7, nome: 'otto bastoni', symb: 'ott', segno: 'B', seed_ix: 0, pos: 8, points: 0, rank: 0 }
      this.deck_info_det52._9b = { ix: 8, nome: 'nove bastoni', symb: 'nov', segno: 'B', seed_ix: 0, pos: 9, points: 0, rank: 0 }
      this.deck_info_det52._db = { ix: 9, nome: 'dieci bastoni', symb: 'die', segno: 'B', seed_ix: 0, pos: 10, points: 0, rank: 0 }
      this.deck_info_det52._Fb = { ix: 10, nome: 'fante bastoni', symb: 'fan', segno: 'B', seed_ix: 0, pos: 11, points: 0, rank: 0 }
      this.deck_info_det52._Cb = { ix: 11, nome: 'cavallo bastoni', symb: 'cav', segno: 'B', seed_ix: 0, pos: 12, points: 0, rank: 0 }
      this.deck_info_det52._Rb = { ix: 12, nome: 're bastoni', symb: 're', segno: 'B', seed_ix: 0, pos: 13, points: 0, rank: 0 }
      //coppe
      this.deck_info_det52._Ac.ix = 13
      this.deck_info_det52._2c.ix = 14
      this.deck_info_det52._3c.ix = 15
      this.deck_info_det52._4c.ix = 16
      this.deck_info_det52._5c.ix = 17
      this.deck_info_det52._6c.ix = 18
      this.deck_info_det52._7c.ix = 19
      this.deck_info_det52._8c = { ix: 20, nome: 'otto coppe', symb: 'ott', segno: 'C', seed_ix: 1, pos: 8, points: 0, rank: 0 }
      this.deck_info_det52._9c = { ix: 21, nome: 'nove coppe', symb: 'nov', segno: 'C', seed_ix: 1, pos: 9, points: 0, rank: 0 }
      this.deck_info_det52._dc = { ix: 22, nome: 'dieci coppe', symb: 'die', segno: 'C', seed_ix: 1, pos: 10, points: 0, rank: 0 }
      this.deck_info_det52._Fc = { ix: 23, nome: 'fante coppe', symb: 'fan', segno: 'C', seed_ix: 1, pos: 11, points: 0, rank: 0 }
      this.deck_info_det52._Cc = { ix: 24, nome: 'cavallo coppe', symb: 'cav', segno: 'C', seed_ix: 1, pos: 12, points: 0, rank: 0 }
      this.deck_info_det52._Rc = { ix: 25, nome: 're coppe', symb: 're', segno: 'C', seed_ix: 1, pos: 13, points: 0, rank: 0 }
      //denari
      this.deck_info_det52._Ad.ix = 26
      this.deck_info_det52._2d.ix = 27
      this.deck_info_det52._3d.ix = 28
      this.deck_info_det52._4d.ix = 29
      this.deck_info_det52._5d.ix = 30
      this.deck_info_det52._6d.ix = 31
      this.deck_info_det52._7d.ix = 32
      this.deck_info_det52._8d = { ix: 33, nome: 'otto denari', symb: 'ott', segno: 'D', seed_ix: 2, pos: 8, points: 0, rank: 0 }
      this.deck_info_det52._9d = { ix: 34, nome: 'nove denari', symb: 'nov', segno: 'D', seed_ix: 2, pos: 9, points: 0, rank: 0 }
      this.deck_info_det52._dd = { ix: 35, nome: 'dieci denari', symb: 'die', segno: 'D', seed_ix: 2, pos: 10, points: 0, rank: 0 }
      this.deck_info_det52._Fd = { ix: 36, nome: 'fante denari', symb: 'fan', segno: 'D', seed_ix: 2, pos: 11, points: 0, rank: 0 }
      this.deck_info_det52._Cd = { ix: 37, nome: 'cavallo denari', symb: 'cav', segno: 'D', seed_ix: 2, pos: 12, points: 0, rank: 0 }
      this.deck_info_det52._Rd = { ix: 38, nome: 're denari', symb: 're', segno: 'D', seed_ix: 2, pos: 13, points: 0, rank: 0 }
      //spade
      this.deck_info_det52._As.ix = 39
      this.deck_info_det52._2s.ix = 40
      this.deck_info_det52._3s.ix = 41
      this.deck_info_det52._4s.ix = 42
      this.deck_info_det52._5s.ix = 43
      this.deck_info_det52._6s.ix = 44
      this.deck_info_det52._7s.ix = 45
      this.deck_info_det52._8s = { ix: 46, nome: 'otto spade', symb: 'ott', segno: 'S', seed_ix: 3, pos: 8, points: 0, rank: 0 }
      this.deck_info_det52._9s = { ix: 47, nome: 'nove spade', symb: 'nov', segno: 'S', seed_ix: 3, pos: 9, points: 0, rank: 0 }
      this.deck_info_det52._ds = { ix: 48, nome: 'dieci spade', symb: 'die', segno: 'S', seed_ix: 3, pos: 10, points: 0, rank: 0 }
      this.deck_info_det52._Fs = { ix: 49, nome: 'fante spade', symb: 'fan', segno: 'S', seed_ix: 3, pos: 11, points: 0, rank: 0 }
      this.deck_info_det52._Cs = { ix: 50, nome: 'cavallo spade', symb: 'cav', segno: 'S', seed_ix: 3, pos: 12, points: 0, rank: 0 }
      this.deck_info_det52._Rs = { ix: 51, nome: 're spade', symb: 're', segno: 'S', seed_ix: 3, pos: 13, points: 0, rank: 0 }
    }

    get_rank(card_lbl) {
      if (this.use_52deck) {
        return this.deck_info_det52[card_lbl].rank;
      }
      return this.deck_info_det[card_lbl].rank;
    }

    get_points(card_lbl) {
      if (this.use_52deck) {
        return this.deck_info_det52[card_lbl].points;
      }
      return this.deck_info_det[card_lbl].points;
    }

    get_card_info(card_lbl) {
      if (this.use_52deck) {
        return this.deck_info_det52[card_lbl];
      }
      return this.deck_info_det[card_lbl];
    }

    get_cards_on_game() {
      return this.cards_on_game;
    }

    set_rank_points(arr_rank, arr_points) {
      var i, symb_card;
      for (i = 0; i < this.cards_on_game.length; i++) {
        var k = this.cards_on_game[i];
        var card = this.deck_info_det[k];
        if (this.use_52deck) {
          card = this.deck_info_det52[k]
        }
        if (card == null) {
          throw (new Error('Error on deck ' + k + ' not found'));
        }
        symb_card = card.symb;
        card.rank = arr_rank[symb_card];
        card.points = arr_points[symb_card];
      }
    }

    deck_info_dabriscola() {
      var val_arr_rank = { sei: 6, cav: 9, qua: 4, re: 10, set: 7, due: 2, cin: 5, asso: 12, fan: 8, tre: 11 };
      var val_arr_points = { sei: 0, cav: 3, qua: 0, re: 4, set: 0, due: 0, cin: 0, asso: 11, fan: 2, tre: 10 };

      this.set_rank_points(val_arr_rank, val_arr_points);
      console.log('Deck briscola created');
    }

  }

  ///////////////////////////////////////////////////////////////////////////////////////
  /// BRISCOLA in DUE
  ///////////////////////////////////////////////////////////////////////////////////////

  export class CoreBriscolaBase extends CoreGameBase {
    _myOpt = {
      tot_num_players: 2, num_segni_match: 2
      , target_points_segno: 61, players: [], num_cards_onhand: 3
      , predef_deck: []
    };
    _deck_info = new DeckInfo();
    _core_data = new CoreDataSupport();
    _briscola_in_tav_lbl = '';

    constructor(_core, _numOfSegni, _pointsForWin) {
      super();
      let that = this;
      let notifyer = new CoreSubjectNtfy(_core, that, { log_missed: true });
      this._deck_info.deck_info_dabriscola();
    }

    StartNewMatch(options) {
      console.log("Start a new match");
      this._myOpt = options || {}
      this._myOpt.predef_deck || [];
      this._myOpt.tot_num_players = this._myOpt.tot_num_players || 2;
      this._myOpt.num_segni_match = this._myOpt.num_segni_match || this._numOfSegni;
      this._myOpt.target_points_segno = this._myOpt.target_points_segno || this._pointsForWin;
      this._myOpt.num_cards_onhand = this._myOpt.num_cards_onhand || 3;
      // var _game_core_recorder = mod_gamerepl.game_core_recorder_ctor();
      // _rnd_mgr.set_predef_deck(this._myOpt.predef_deck);

      this._core_data.start(this._myOpt.tot_num_players, this._myOpt.players, this._myOpt.num_cards_onhand);
      this._core.fire_all('ev_new_match', {
        players: this._core_data.players
        , num_segni: this._myOpt.num_segni_match, target_segno: this._myOpt.target_points_segno
      });
      this._core.submit_next_state('st_new_giocata');
    }

    act_player_sit_down(name, pos) { }

    act_alg_play_acard(player_name, lbl_card) {
      this.check_state('st_wait_for_play');
      console.log('Player ' + player_name + ' played ' + lbl_card);
      if (this._core_data.player_on_turn !== player_name) {
        this._log.warn('Player ' + player_name + ' not allowed to play now');
        return;
      }
      let cards = this._core_data.carte_in_mano[player_name];
      let pos = cards.indexOf(lbl_card);
      let data_card_gioc = { player_name: player_name, card_played: lbl_card };
      if (pos !== -1) {
        //_game_core_recorder.store_player_action(player.name, 'cardplayed', player.name, lbl_card);
        var old_size = this._core_data.carte_in_mano[player_name].length;
        this._core_data.carte_in_mano[player_name].splice(pos, 1);
        this._log.info('++' + this._core_data.mano_count + ',' + this._core_data.carte_gioc_mano_corr.length +
          ',Card ' + lbl_card + ' played from player ' + player_name);
        this._core_data.carte_gioc_mano_corr.push({ lbl_card: lbl_card, player: player_name });
        this._core.fire_all('ev_player_has_played', { cards_played: data_card_gioc });
        this._core_data.round_players.splice(0, 1);
        //_log.debug('_carte_in_mano ' + player_name + ' size is ' + this._core_data.carte_in_mano[player.name].length + ' _round_players size is ' + this._core_data.round_players.length);
        //_log.debug('*** new size is ' + this._core_data.carte_in_mano[player.name].length + ' old size is ' + old_size);
        this._core.submit_next_state('st_continua_mano');
      } else {
        this._log.warn('Card ' + lbl_card + ' not allowed to be played from player ' + player_name);
        this._core.fire_to_player(player_name, 'ev_player_cardnot_allowed', { hand_player: cards, wrong_card: lbl_card });
      }
    }

    st_new_giocata() {
      this.set_state('st_new_giocata');
      let cards = this._deck_info.get_cards_on_game().slice();
      //let first_player_ix = _rnd_mgr.get_first_player(_players.length);
      // cards =_rnd_mgr.get_deck(cards);
      let first_player_ix = 1;
      this._core_data.start_new_giocata(first_player_ix, cards);
      this.distribute_cards();
      this._core_data.players.forEach(player => {
        let data_newgioc = {
          carte: this._core_data.carte_in_mano[player]
          , brisc: this._briscola_in_tav_lbl
        };
        this._core.fire_to_player(player, 'ev_brisc_new_giocata', data_newgioc);
      });

      this._core.submit_next_state('st_new_mano');
    }

    st_new_mano() {
      this.set_state('st_new_giocata');
      this._core.fire_all('ev_new_mano', { mano_count: this._core_data.mano_count });
      this._core.submit_next_state('st_continua_mano');
    }

    st_continua_mano() {
      this.set_state('st_continua_mano');
      let player = this._core_data.switch_player_on_turn();
      if (player) {
        console.log('Player on turn: ' + player);
        this._core.fire_all('ev_have_to_play', { player_on_turn: player });
        this._core.submit_next_state('st_wait_for_play');
      } else {
        this._core.submit_next_state('st_mano_end');
      }
    }

    st_wait_for_play() {
      this.set_state('st_wait_for_play');
    }

    st_mano_end() {
      this.set_state('st_mano_end');
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
  }


  export class AlgBriscBase {
    _deck_info = new DeckInfo();
    _actorNotifier;
    _player_name;
    _points_segno = {};
    _opp_names = [];
    _team_mates = [];
    _players = [];
    _level_alg = 'dummy';
    _strozzi_on_suite = {};
    _num_cards_on_deck = 0;
    _target_points = 61;
    _num_cards_on_player_hand = 3;
    _deck_size = 40;
    _num_brisc_intavola = 1;
    _max_numcards_ondeck = 33;
    _cards_on_hand = [];
    _briscola = undefined;
    _card_played = [];
    _options = {
      use_delay_before_play: false,
      timeout_haveplay: 300
    };

    constructor(_playerActor) {
      let that = this;
      this._actorNotifier = new ActorSubjectNtfy(_playerActor.getCore(),
        that, { log_all: false, log_missed: true });

      this._player_name = _playerActor.Player.Name;
      this._log.change_nametype("Alg][" + this._player_name);
      this._actorNotifier.subscribePlayer(this._player_name);

    }

    on_all_ev_new_match(args) {
      this._log.debug("New match " + JSON.stringify(args));
      this._players = args.players;
      this._target_points = args.target_segno;
      this._log.info('New match, ' + this._player_name + '  is playing level ' + this._level_alg + ' ( game with ' + this._players.length + ' players)');
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
      this._log.debug("New giorcata " + JSON.stringify(args));
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
      this._log.debug("New mano " + JSON.stringify(args));
      this._card_played = [];
    }

    on_all_ev_have_to_play(args) {
      this._log.debug("Have to play " + JSON.stringify(args));
      if (args.player_on_turn === this._player_name) {
        this._log.debug("Play a card please");
        if (this._options.use_delay_before_play) {
          this._log.debug('Delay before play ms: ' + this._options.timeout_haveplay);
          setTimeout(x => this.alg_play_acard(), this._options.timeout_haveplay);
        } else {
          this.alg_play_acard();
        }
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
      this._log.debug('alg on play: ' + this._player_name + ', cards N: ' + this._cards_on_hand.length + ' hand ' + this._cards_on_hand);
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
        this._log.debug('Want to play the card ' + card);
        this._playerActor.play_card(card);
      } else if (this._level_alg !== 'predefined') {
        throw (new Error('alg_play_acard: Card to be played not found'));
      } else {
        this._log.debug('Unable to play beacuse no card is suggested');
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
      this._log.debug('Play as first: best card ' + min_item[0] + ' (w_cards = ' + w_cards + ')');
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

      this._log.debug('play_as_master_second, cards ' + this._cards_on_hand);
      if (take_it.length === 0) {
        //take_it is not possibile, use leave it
        this._log.debug("play_as_master_second, apply R1")
        return min_card_leave;
      }
      if (tot_points_if_take > this._target_points) {
        this._log.debug("play_as_master_second, apply R2");
        return max_card_take;
      }
      max_card_take_s = max_card_take;
      if (max_card_take_s[2] === this._briscola[2]) {
        // card that take is briscola, pay attention to play it
        if (max_points_take >= 20) {
          this._log.debug("play_as_master_second, apply R3");
          return max_card_take;
        }
      } else if (max_points_take >= 10 && this._num_cards_on_deck > 1) {
        // take it because strosa
        this._log.debug("play_as_master_second, apply R4");
        return max_card_take;
      }
      if (min_points_leave === 0) {
        // don't lose any points, leave it
        this._log.debug("play_as_master_second, apply R10");
        return min_card_leave;
      }
      if (this._num_cards_on_deck === 1) {
        // last hand before deck empty
        // if briscola is big we play a big card
        if (this._briscola[1] === 'A' || this._briscola[1] === '3') {
          if (leave_it.length > 0) {
            this._log.debug("play_as_master_second, apply R9");
            return min_card_leave;
          } else {
            // incartato
            this._log.debug("play_as_master_second, apply R9a");
            return max_card_take;
          }
        } else if (this._briscola[1] === 'R' || this._briscola[1] === 'C' || this._briscola[1] === 'F') {
          if (min_points_leave <= 4) {
            this._log.debug("play_as_master_second, apply R8");
            return min_card_leave;
          }
        }
      }
      if (take_it.length > 0) {
        // we can take it
        if (curr_points_opp > 40 && max_points_take > 0) {
          this._log.debug("play_as_master_second, apply R5");
          return this.best_taken_card(take_it);
        }
        if (min_points_leave > 3 && take_it.length > 1) {
          // leave-it lose points and I have at least two cards for taken -> take it.
          this._log.debug("play_as_master_second, apply R6");
          return this.best_taken_card(take_it);
        }
        if (min_points_leave > 5) {
          card_best_taken_s = this.best_taken_card(take_it);
          if (card_best_taken_s[2] === this._briscola[2]) {
            // best card is a briscola
            if (min_points_leave <= 8 && curr_points_opp < 53
              && (card_best_taken_s[1] === 'A' || card_best_taken_s[1] === '3')) {
              // taken with A or 3 is too much forced
              this._log.debug("play_as_master_second, apply R12");
              return min_card_leave;
            }
          }
          // leave-it loose to many points
          this._log.debug("play_as_master_second, apply R11");
          return card_best_taken_s;
        }
        card_best_taken_s = this.best_taken_card(take_it);
        if (card_best_taken_s[2] !== this._briscola[2]
          && !card_s[1].match(/[24567]/)) {
          // make points without briscola
          this._log.debug("play_as_master_second, apply R13");
          return card_best_taken_s;
        }
      }
      // at this point we can only leave-it
      this._log.debug("play_as_master_second, apply R7");
      return min_card_leave;
    }

    best_taken_card(take_it) {
      let w_cards = [], card_s, segno, curr_w, lisc_val, min_item;
      this._log.debug("calculate best_taken_card");
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
      this._log.debug('Best card to play on best_taken_card is' + min_item[0] + ' w_cards = ' + w_cards);
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


})();
