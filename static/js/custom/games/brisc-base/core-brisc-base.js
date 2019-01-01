import { CoreDataSupport } from '../../common/core/core-data-support.js'
import { DeckInfo } from '../../common/deck-info.js'
import { CoreStateStore } from '../../common/core/core-state-store.js'
import { CoreStateSubjectSubscriber } from '../../common/core/core-state-subject-subscriber.js'
import { RndMgr } from '../../common/rnd-mgr.js'

//////////////////////////////////////////
//////////////////////////////// CoreBriscolaBase
//////////////////////////////////////////
export class CoreBriscolaBase {
  constructor(_coreStateManager, _numOfSegni, _pointsForWin) {
    this._coreStateStore = new CoreStateStore()
    this._myOpt = {
      tot_num_players: 2, num_segni_match: 2
      , target_points_segno: 61, players: [], num_cards_onhand: 3
      , predef_deck: [], predef_ix: -1
    };
    this._coreStateManager = _coreStateManager
    this._numOfSegni = _numOfSegni
    this._pointsForWin = _pointsForWin
    this._deck_info = new DeckInfo();
    this._core_data = new CoreDataSupport();
    this._briscola_in_tav_lbl = '';
    let that = this;
    this._subscriber = new CoreStateSubjectSubscriber(_coreStateManager, that, { log_missed: true });
    this._deck_info.deck_info_dabriscola();
    this._rnd_mgr = new RndMgr()
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
    // this._game_core_recorder = mod_gamerepl.game_core_recorder_ctor();

    this._core_data.start(this._myOpt.tot_num_players, this._myOpt.players, this._myOpt.num_cards_onhand);
    this._coreStateManager.fire_all('ev_new_match', {
      players: this._core_data.players
      , num_segni: this._myOpt.num_segni_match, target_segno: this._myOpt.target_points_segno
    });
    this._coreStateManager.submit_next_state('st_new_giocata');
  }

  ignore_state(state) {
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

    console.log('Punti fatti nella mano ', punti_presi);

    this._coreStateManager.fire_all('ev_mano_end', { player_best: wininfo.player_best, carte: carte_prese_mano, punti: punti_presi });
    this._core_data.historize_mano()
    this._core_data.add_points_toplayer(wininfo.player_best, punti_presi)

    if (this.check_if_giocata_is_terminated()) {
      this._coreStateManager.submit_next_state('st_giocata_end');
    } else if (this._core_data.mazzo_gioco.length > 0) {
      this._coreStateManager.submit_next_state('st_pesca_carta');
    } else {
      this._coreStateManager.submit_next_state('st_new_mano');
    }
  }

  st_pesca_carta() {
    console.log('st_pesca_carta');
    let brisc_tav_available = true;
    if (this._core_data.mazzo_gioco.length <= 0) {
      throw (new Error('Deck is empty, programming error'));
    }
    this._core_data.round_players.forEach(player => {
      let carte_player = [];
      if (this._core_data.mazzo_gioco.length > 0) {
        carte_player.push(this._core_data.mazzo_gioco.pop());
      } else if (brisc_tav_available) {
        carte_player.push(this._briscola_in_tav_lbl);
        brisc_tav_available = false;
      } else {
        throw (new Error('Briscola already assigned, programming error'));
      }
      carte_player.forEach(c => {
        this._core_data.carte_in_mano[player].push(c)
      });
      if (this._core_data.carte_in_mano[player].length > this._core_data.num_of_cards_onhandplayer) {
        throw (new Error('To many cards in hand player ' + player));
      }
      let data_cartapesc = { carte: carte_player }
      this._coreStateManager.fire_to_player(player, 'ev_pesca_carta', data_cartapesc);

    });

    console.log('Mazzo rimanenti: ' + this._core_data.mazzo_gioco.length);
    this._coreStateManager.submit_next_state('st_new_mano');

    //throw (new Error('Stop! check it before continue'))
  }

  st_giocata_end() {
    console.log('st_giocata_end');
    let bestpoints_info = this.giocata_end_update_score();
    //this._game_core_recorder.store_end_giocata(best_pl_points);
    this._coreStateManager.fire_all('ev_giocata_end', { best: bestpoints_info.best_pl_points });
    if (bestpoints_info.is_match_end) {
      this._coreStateManager.submit_next_state('st_match_end');
    } else {
      this._coreStateManager.submit_next_state('st_wait_continue_game');
    }
  }

  giocata_end_update_score() {
    //throw (new Error('Stop! check it before continue'))
    if(!this._core_data.segni_curr_match.is_started()){
      console.warn('Update score is not available on segno state', this._core_data.segni_curr_match.segno_state)
      return this._core_data.segni_curr_match.bestpoints_info
    }
    let m_score = this._core_data.segni_curr_match.score
    let curr_segno_info = this._core_data.segni_curr_match

    console.log('calculate best points');
    let arr = [...this._core_data.points_curr_segno.entries()]
    //let best_pl_points = new Array([...this._core_data.points_curr_segno.entries()].sort((a,b) => a[1] < b[1]));
    let best_pl_points = arr.sort(function (a, b) {
      return b[1] - a[1];
    });
    let nome_gioc_max = best_pl_points[0][0];
    
    if (best_pl_points[0][1] == best_pl_points[1][1]) {
      console.log('Game draw all have scored ' + best_pl_points[0][1]);
      curr_segno_info.set_draw()
    } else {
      console.log('Giocata winner is ' + nome_gioc_max + ' points scored are ' + best_pl_points[0][1]);
      console.log('Giocata result is ' + best_pl_points[0][1] + ' - ' + best_pl_points[1][1]);
      m_score.set(nome_gioc_max, m_score.get(nome_gioc_max) + 1);
      curr_segno_info.set_end()
    }
    let is_match_end = false
    if (m_score.get(nome_gioc_max) >= this._myOpt.num_segni_match) {
      console.log('Game terminated, winner is ' + nome_gioc_max);

      arr = [...m_score.entries()].sort(function (a, b) {
        return b[1] - a[1];
      });
      arr.forEach(pair => {
        console.log(pair[0] + ' segni ' + pair[1]);
        this.match_info.score.push(pair);
      });
      this.match_info.end_reason = 'segni_count';
      this.match_info.winner_name = nome_gioc_max;
      is_match_end = true
    }

    let res = {
      best: best_pl_points,
      is_match_end: is_match_end
    }
    curr_segno_info.set_giocata_end_score(res)

    return res;
  }

  check_if_giocata_is_terminated() {
    let res = false;
    let tot_num_cards = 0
    for (let v in this._core_data.carte_in_mano) {
      tot_num_cards += this._core_data.carte_in_mano[v].length;
    }

    //console.log('tot_num_cards ' + tot_num_cards);
    tot_num_cards += this._core_data.mazzo_gioco.length;
    console.log('Giocata end? cards yet in game are: ' + tot_num_cards);
    if (tot_num_cards <= 0) {
      console.log('Giocata end beacuse no more cards have to be played');
      res = true;
    }
    return res;
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