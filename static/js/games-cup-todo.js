/* functions that need to be exported in cup namespace*/
(function () {



  // ----------- ActorSubjectNtfy -------------

  

  
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
