const cup = {};
//(function () { // intellisense in vscode non funziona se metto pattern per isolare oggetti privati. Gli oggetti privati hanno la lettera iniziale minuscola
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
      this.players = []; // use simple name
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
        this.segni_curr_match.score[player] = 0;
      }
    }

    start_new_giocata(first_ix, cards) {
      this.segni_curr_match.segno_state = 'Started';
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
        throw ('Player not found', player)
      }
      this.round_players = this.calc_round_players(ix)
    }
  }

  //////////////////////////////////////////
  //////////////////////////////// coreQueue
  //////////////////////////////////////////
  cup.coreQueue = class coreQueue {
    constructor(queue_name, coreStateManager) {
      this.registry = [];
      this._coreStateManager = coreStateManager
      this._queue_name = queue_name
    }

    submit(func, args) {
      if (func == null) { throw (new Error('Handler is null')); }
      this.registry.push({ func: func, parameters: [args] });
      //console.log("Item submitted, queue size: " + this.registry.length + ' on ' + this._queue_name);
    }

    process_first() {
      //console.log('item process START, queue size: ' + this.registry.length + ' on ' + this._queue_name)
      if (this.registry.length == 0) {
        return;
      }
      var funinfo = this.registry.shift();
      try {
        funinfo.func.apply(this._coreStateManager, funinfo.parameters);
      } catch (e) {
        console.error('Error on executing action handler process_first \nparam ' + JSON.stringify(funinfo.parameters) + '\nError: ' + e + '\n Stack: ' + e.stack);
        throw (e);
      }
      //console.log('item process END, queue size: ' + this.registry.length + ' on ' + this._queue_name)
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
  //////////////////////////////// internalStateProc
  //////////////////////////////////////////
  let yeldInternalProcess = function* (intStProc) {
    // perpetual sequence with generator
    // returns 
    // { done: false, value: the sum of _action_queued and _proc_queue still pending }
    //this._proc_queue.log_state();
    //this._action_queued.log_state();
    while (true) {
      if (intStProc._suspend_queue_proc) {
        yield 0;
      }
      while (intStProc._proc_queue.has_items() && !intStProc._suspend_queue_proc) {
        intStProc._proc_queue.process_first();
        yield intStProc._proc_queue.size() + intStProc._action_queued.size()
      }
      if (intStProc._suspend_queue_proc) {
        yield 0;
      }
      if (intStProc._action_queued.has_items()) {
        try {
          intStProc._action_queued.process_first();
        } catch (e) {
          if (intStProc._env === 'develop') {
            throw (new Error(e));
          } else {
            console.warn('Action ignored beacuse: ' + e);
          }
        }
      }
      if (intStProc._suspend_queue_proc) {
        yield 0;
      }
      //this._proc_queue.log_state();
      //this._action_queued.log_state();

      yield intStProc._proc_queue.size() + intStProc._action_queued.size();
    }
  }

  cup.internalStateProc = class internalStateProc {

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
      return yeldInternalProcess(this).next();
    }
  }

  //////////////////////////////////////////
  //////////////////////////////// CoreStateManager
  //////////////////////////////////////////
  cup.CoreStateManager = class CoreStateManager {
    // _env: 'develop', 'production'
    // Lo scopo di questa classe è quello di avere un unico processore di stati
    // che viene usato attraverso diverse classi, come CoreBriscolaBase e TableStateCore.
    // In CoreStateManager viene pubblicata una serie di funzioni che vengono usate
    // anche per pubblicare eventi al player
    // CoreBriscolaBase e TableStateCore non si cambiano stati e eventi, ma sono osservatori
    // dell'unico oggetto che contiene lo stato attuale e le sue code di eventi. 
    // internalStateProc invece gestisce internamente le code e gli switch degli stai.
    constructor(_env) {
      let that = this;
      this._alg_action_queue = new cup.coreQueue("alg-action", that);
      this._core_state_queue = new cup.coreQueue("core-state", that);
      this._subjectStateAction = new rxjs.Subject();
      this.event_for_all = new rxjs.Subject();

      this.event_for_player = {};
      this._internalStateProc = new cup.internalStateProc(
        this._alg_action_queue,
        this._core_state_queue,
        _env);
    }

    // ICore
    process_next() { return this._internalStateProc.process_next(); }

    get_subject_state_action() {
      return this._subjectStateAction;
    }

    submit_next_state(name_st) {
      let that = this;
      this._core_state_queue.submit(function (args) {
        that._subjectStateAction.next(args)
      }, { is_action: false, name: name_st, args_arr: [] });
    }

    fire_all(event_name, args_payload) {
      this.event_for_all.next({ event: event_name, args: args_payload });
    }

    fire_to_player(player, event_name, args_payload) {
      this.get_subject_for_player(player).next({ event: event_name, args: args_payload });
    }

    clear_gevent() {
      this._internalStateProc.clear();
    }

    // IActorHandler
    suspend_proc_gevents(str) { this._internalStateProc.suspend_proc_gevents(str); }
    continue_process_events(str) { this._internalStateProc.continue_process_events(str); }

    submit_action(action_name, act_args) {
      let that = this;
      this._alg_action_queue.submit(function (args) {
        that._subjectStateAction.next(args)
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
      let resProc = this._internalStateProc.process_next();
      while (resProc.value > 0) {
        resProc = this._internalStateProc.process_next();
      }
    }
  }

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

  //////////////////////////////////////////
  //////////////////////////////// RndMgr
  //////////////////////////////////////////
  cup.RndMgr = class RndMgr {
    constructor() {
      this._predefCards = []
      this._predefPlayerIx = -1
    }

    set_predefined_deck(card_obj) {
      if (card_obj && typeof (card_obj) === 'string') {
        let deck_to_use = card_obj.split(",");
        this._predefCards = deck_to_use
      }else if(card_obj && Array.isArray(card_obj)){
        this._predefCards = card_obj
      }
    }

    set_predefined_player(ix) {
      this._predefPlayerIx = ix
    }

    get_deck(cards) {
      if (this._predefCards.length > 0) {
        console.log('CAUTION: using a presetted deck')
        return [...this._predefCards]
      }
      return this.shuffle(cards)
    }

    get_first_player(size) {
      if (this._predefPlayerIx !== -1) {
        console.log('CAUTION: using a presetted first player')
        return this._predefPlayerIx
      }
      let i = Math.floor(Math.random() * size);
      return i
    }

    shuffle(source) {
      //Knuth-Fisher-Yates shuffle algorithm.
      let array = [...source]
      let m = array.length, t, i;
      // While there remain elements to shuffle…
      while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);
        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
      }

      return array;
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
      this._deck_info = new cup.DeckInfo();
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
      this._deck_info = new cup.DeckInfo();
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

  //////////////////////////////////////////
  //////////////////////////////// DeckInfo
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

  cup.IDeckInfo40 = class IDeckInfo40 {
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

  cup.IDeckInfo52 = class IDeckInfo52 extends cup.IDeckInfo40 {
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

      this.deck_info_det52 = new cup.IDeckInfo52()
      this.deck_info_det = new cup.IDeckInfo40()
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
      return this.cards_on_game.slice();
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
//})();
