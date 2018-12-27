const cup = {};
(function () {

  //////////////////////////////////////////
  //////////////////////////////// MatchInfo
  //////////////////////////////////////////

  cup.MatchInfo = class MatchInfo {
    constructor() {
      this.match_state = '';
      this.score = [];
      this.end_reason = '';
      this.winner_name = '';
    }

    start() {
      this.match_state = 'Started';
      this.score = [];
      this.end_reason = '';
      this.winner_name = '';
    }
  }

  //////////////////////////////////////////
  //////////////////////////////// CoreDataSupport
  //////////////////////////////////////////

  cup.CoreDataSupport = class CoreDataSupport {
    constructor() {
      this.segni_curr_match = { score: {}, segno_state: '' };
      this.match_state = '';
      this.match_info = new cup.MatchInfo();
      this.players = [];
      this.carte_prese = {};
      this.carte_in_mano = {};
      this.carte_gioc_mano_corr = [];
      this.history_mano = [];
      this.mano_count = 0;
      this.first_player_ix = 0;
      this.round_players = [];
      this.points_curr_segno = {};
      this.mazzo_gioco = [];
      this.num_of_cards_onhandplayer = 3;
      this.player_on_turn = null;
    }
    // var _carte_gioc_mano_corr = []

    start(num_of_players, players, hand_player_size) {
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
        this.segni_curr_match.score[player] = 0;
      }
    }

    start_new_giocata(first_ix, cards) {
      this.segni_curr_match.segno_state = CoreStateEnum.Started;
      this.carte_prese = {};
      this.carte_in_mano = {};
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
        this.points_curr_segno[player] = 0;
        this.carte_prese[player] = [];
        this.carte_in_mano[player] = [];
      }
      this.mazzo_gioco = cards;
      console.log('Current deck: ' + this.mazzo_gioco.join(','));
    }

    switch_player_on_turn() {
      this.player_on_turn = this.round_players.length > 0 ? this.round_players[0] : null;
      return this.player_on_turn;
    }

    calc_round_players(first_ix) {
      var ins_point = -1, round_players = [], onlast = true;
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
  }

  //////////////////////////////////////////
  //////////////////////////////// CoreQueue
  //////////////////////////////////////////
  class CoreQueue {
    constructor(queue_name, executer) {
      this.registry = [];
    }


    submit(func, args) {
      if (func == null) { throw (new Error('Handler is null')); }
      this.registry.push({ func: func, parameters: [args] });
      //console.log("Item submitted, queue size: " + registry.length + ' on ' + queue_name);
    }

    process_first() {
      //console.log('item process START, queue size: ' + registry.length + ' on ' + queue_name)
      if (this.registry.length == 0) {
        return;
      }
      var funinfo = this.registry.shift();
      try {
        funinfo.func.apply(this.executer, funinfo.parameters);
      } catch (e) {
        console.error('Error on executing action handler process_first \nparam ' + JSON.stringify(funinfo.parameters) + '\nError: ' + e + '\n Stack: ' + e.stack);
        throw (e);
      }
      //console.log('item process END, queue size: ' + registry.length + ' on ' + queue_name)
    }

    has_items() {
      return this.registry.length > 0 ? true : false;
    }

    size() {
      return this.registry.length;
    }

    log_state() {
      console.log('queue: ' + this.queue_name + ' with items ' + this.registry.length);
    }

    clear() {
      this.registry = [];
    }

  }

  //////////////////////////////////////////
  //////////////////////////////// StateActionProcessor
  //////////////////////////////////////////
  class StateActionProcessor {

    constructor(action_queued, proc_queue, env) {
      this._suspend_queue_proc = false;
      this._num_of_suspend = 0;
      this._env = env;
      this._proc_queue = proc_queue;
      this._action_queued = action_queued;
    }

    get_action_queue() { return this._action_queued; }
    get_proc_queue() { return this._proc_queue; }

    suspend_proc_gevents(str) {
      this._suspend_queue_proc = true;
      this._num_of_suspend += 1;
      console.log('suspend_proc_gevents (' + str + ' add lock ' + this._num_of_suspend + ')');
    }

    clear() {
      this._action_queued.clear();
      this._proc_queue.clear();
      this._num_of_suspend = 0;
    }

    continue_process_events(str1) {
      var str = str1 || '--';
      if (this._num_of_suspend <= 0) { return; }

      this._num_of_suspend -= 1;
      if (this._num_of_suspend <= 0) {
        this._num_of_suspend = 0;
        this._suspend_queue_proc = false;
        console.log('Continue to process core events (' + str + ')');
        this.process_next();
      } else {
        console.log('Suspend still locked (locks: ' + this._num_of_suspend + ') (' + str + ')');
      }
    }

    process_next() {
      //this._proc_queue.log_state();
      //this._action_queued.log_state();
      if (this._suspend_queue_proc) {
        return 0;
      }
      while (this._proc_queue.has_items() && !this._suspend_queue_proc) {
        this._proc_queue.process_first();
      }
      if (this._suspend_queue_proc) {
        return 0;
      }
      if (this._action_queued.has_items()) {
        try {
          this._action_queued.process_first();
        } catch (e) {
          if (this._env === 'develop') {
            throw (new Error(e));
          } else {
            console.warn('Action ignored beacuse: ' + e);
          }
        }
      }
      if (this._suspend_queue_proc) {
        return 0;
      }
      //this._proc_queue.log_state();
      //this._action_queued.log_state();

      return this._proc_queue.size() + this._action_queued.size();
    }
  }

  //////////////////////////////////////////
  //////////////////////////////// CoreStateEventBase
  //////////////////////////////////////////
  cup.CoreStateEventBase = class CoreStateEventBase {
    // _env: 'develop', 'production'
    constructor(_env) { // TODO: prova a vedere se riesci ad usare dei workflows, esempio standalone va subito allo start.
      let that = this;
      this._alg_action = new CoreQueue("alg-action", that);
      this._core_state = new CoreQueue("core-state", that);
      this._subStateAction = new rxjs.Subject();
      this.event_for_all = new rxjs.Subject();

      this.event_for_player = {};
      this._processor = new StateActionProcessor(
        this._alg_action,
        this._core_state,
        _env);
    }

    // ICore
    process_next() { return this._processor.process_next(); }

    get_subject_state_action() {
      return this._subStateAction;
    }

    submit_next_state(name_st) {
      let that = this;
      this._core_state.submit(function (args) {
        that._subStateAction.next(args)
      }, { is_action: false, name: name_st, args_arr: [] });
    }

    fire_all(event_name, args_payload) {
      this.event_for_all.next({ event: event_name, args: args_payload });
    }

    fire_to_player(player, event_name, args_payload) {
      this.get_subject_for_player(player).next({ event: event_name, args: args_payload });
    }

    clear_gevent() {
      this._processor.clear();
    }

    // IActorHandler
    suspend_proc_gevents(str) { this._processor.suspend_proc_gevents(str); }
    continue_process_events(str) { this._processor.continue_process_events(str); }

    submit_action(action_name, act_args) {
      let that = this;
      this._alg_action.submit(function (args) {
        that._subStateAction.next(args)
      }, { is_action: true, name: action_name, args_arr: act_args })
    }

    get_subject_for_all_players() {
      return this.event_for_all;
    }

    get_subject_for_player(player) {
      if (this.event_for_player[player] == null) {
        this.event_for_player[player] = new rxjs.Subject();
      }
      return this.event_for_player[player];
    }

    // other
    process_all() {
      let numRemProc = 1
      while (numRemProc > 0) {
        numRemProc = this._processor.process_next();
      }
    }
  }

  //////////////////////////////////////////
  //////////////////////////////// CoreStateEventBase
  //////////////////////////////////////////
  cup.DeckInfoItem = class DeckInfoItem {
    constructor() {
      this.ix;
      this.nome;
      this.symb;
      this.segno;
      this.seed_ix;
      this.pos;
      this.rank;
      this.points;
    }
  }

  class IDeckInfo40 {
    constructor() {
      this._Ab = {};
      this._2b = {};
      this._3b = {};
      this._4b = {};
      this._5b = {};
      this._6b = {};
      this._7b = {};
      this._Fb = {};
      this._Cb = {};
      this._Rb = {};
      this._Ac = {};
      this._2c = {};
      this._3c = {};
      this._4c = {};
      this._5c = {};
      this._6c = {};
      this._7c = {};
      this._Fc = {};
      this._Cc = {};
      this._Rc = {};
      this._Ad = {};
      this._2d = {};
      this._3d = {};
      this._4d = {};
      this._5d = {};
      this._6d = {};
      this._7d = {};
      this._Fd = {};
      this._Cd = {};
      this._Rd = {};
      this._As = {};
      this._2s = {};
      this._3s = {};
      this._4s = {};
      this._5s = {};
      this._6s = {};
      this._7s = {};
      this._Fs = {};
      this._Cs = {};
      this._Rs = {};
    }
  }

  class IDeckInfo52 extends IDeckInfo40 {
    constructor() {
      super();
      this._8b = {};
      this._9b = {};
      this._db = {};
      this._8c = {};
      this._9c = {};
      this._dc = {};
      this._8d = {};
      this._9d = {};
      this._dd = {};
      this._8s = {};
      this._9s = {};
      this._ds = {};
    }
  }

  cup.DeckInfo = class DeckInfo {

    constructor() {

      this.deck_info_det52 = new IDeckInfo52()
      this.deck_info_det = new IDeckInfo40()
      this.use_52deck = false

      this.cards_on_game = [
        '_Ab', '_2b', '_3b', '_4b', '_5b', '_6b', '_7b', '_Fb', '_Cb', '_Rb',
        '_Ac', '_2c', '_3c', '_4c', '_5c', '_6c', '_7c', '_Fc', '_Cc', '_Rc',
        '_Ad', '_2d', '_3d', '_4d', '_5d', '_6d', '_7d', '_Fd', '_Cd', '_Rd',
        '_As', '_2s', '_3s', '_4s', '_5s', '_6s', '_7s', '_Fs', '_Cs', '_Rs'];

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


})();
