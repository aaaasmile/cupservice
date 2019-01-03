import { DeckInfo } from '../../common/deck-info.js'
import { ActorStateSubjectSubscriber } from '../../common/actor-state-subject-subscriber.js'

//////////////////////////////////////////
//////////////////////////////// AlgBriscBase
//////////////////////////////////////////
export class AlgBriscBase {


  constructor(_playerActor) {
    this._playerActor = _playerActor // TODO use new PlayerActor(this,coreStateManager)
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
    this._actorNotifier = new ActorStateSubjectSubscriber(
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

  on_all_ev_giocata_end(args) {
    console.log("[%s] giocata end " + JSON.stringify(args), this._player_name); 
  }

  on_all_ev_match_end(args){
    //args = {info: {"match_state":"end","final_score":[["Ernesto",2],["Luigi",0]],"end_reason":"segni_count","winner_name":"Ernesto"}}
    console.log("[%s] match end ", this._player_name, args); 
    let info = JSON.parse(args.info)
    let winner = info.final_score[0]
    if(winner[0] === this._player_name){
      console.log(`${this._player_name}: Ohhhh yeah!!!!`)
    }
  }

  on_all_ev_waiting_tocontinue_game(args){
    console.log("[%s] continue game " + JSON.stringify(args), this._player_name); 
    this._playerActor.continue_game(this._player_name);
  }

  on_pl_ev_pesca_carta(args) {
    console.log("[%s] pesca_carta " + JSON.stringify(args), this._player_name);
    this._cards_on_hand.push(args.carte[0]);
    this._num_cards_on_deck -= this._players.length;
  }

  on_all_ev_new_mano(args) {
    console.log("[%s] New mano " + JSON.stringify(args), this._player_name);
    this._card_played = [];
  }

  on_all_ev_mano_end(args) {
    console.log("[%s] Mano end " + JSON.stringify(args), this._player_name);
    let player_best = args.player_best
    let carte_prese_mano = args.carte
    let punti_presi = args.punti;
    this._points_segno[player_best] += punti_presi
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
