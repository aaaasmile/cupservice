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

})();
