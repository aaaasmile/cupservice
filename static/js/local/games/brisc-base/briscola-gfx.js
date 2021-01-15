import { DeckGfx } from '../../gfx/deck-gfx.js'
import { CardsPlayerGfx } from '../../gfx/cards-player-gfx.js'
import { PlayerMarkerGfx } from '../../gfx/player-marker-gfx.js'
import { ScoreBoardGfx } from '../../gfx/scoreboard-gfx.js'
import AniCards from '../../gfx/animation-gfx.js'
import store from '../../../vue/store/index.js'
import { PrepareGameVsCpu } from './core-brisc-base.js'
import { TableCardsPlayedGfx } from '../../gfx/table-cards-played.js'
import { DeckTakenGfx } from '../../gfx/deck-taken-gfx.js'

export class BriscolaGfx {
  constructor(cache, static_scene) {
    this._cache = cache
    this._staticScene = static_scene
    this._deck_info = null
    this._core_state = null
    this._num_players = null
    this._name_Me = ''
    this._name_Opp = ''
    this._block_for_ask_continue_game = null
  }

  BuildBriscolaGameVsCpu() {
    const opt = store.state.pl.briscola_opt
    opt.namePl1 = store.state.pl.namePl1
    opt.namePl2 = store.state.pl.namePl2
    opt.points_to_win = 61
    opt.cards_in_hand = 3
    this._core_caller = null
    this._alg = null
    let b2core = PrepareGameVsCpu(this, opt, (core_caller, alg) => {
      console.log('Callback for tuning alg')
      this._core_caller = core_caller
      this._alg = alg
      this._alg.set_automatic_continuation(false)
      if (store.state.pl.auto_player_gfx) {
        console.log('Want an automatic player on gfx')
        this._alg.set_automatic_playing(true)
      }
      this._alg.set_to_master_level()
    })
    this._deck_info = b2core._deck_info
    this._cache.check_deckinfo(this._deck_info)
    this._core_state = b2core._coreStateManager

    store.commit('changeGameState', 'st_match_ongoing')

    return b2core._coreStateManager
  }

  on_all_ev_new_match(args) {
    console.log('on_all_ev_new_match ', args)
    //args: {players: Array(2), num_segni: 2, target_segno: 61}
    //       players: ["Luisa", "Silvio"]
    this.register_abbandona_action()
    this._staticScene.clear_all_components()
    this._num_players = args.players.length
    const nameCpu = args.players[0]
    this._name_Opp = nameCpu
    const markerCpu = new PlayerMarkerGfx(100, this._cache)
    const avatarCpu = store.state.pl.opp_avatar
    markerCpu.Build(nameCpu, avatarCpu)
    markerCpu._infoGfx = { x: { type: 'right_anchor', offset: -30 }, y: { type: 'top_anchor', offset: 20 }, anchor_element: 'canvas', }
    this._staticScene.AddMarker(nameCpu, markerCpu)

    const nameMe = args.players[1]
    const markerMe = new PlayerMarkerGfx(200, this._cache)
    //console.log('Player store is: ', store)
    const avatarMe = store.state.pl.me_avatar
    markerMe.Build(nameMe, avatarMe)
    markerMe._infoGfx = { x: { type: 'right_anchor', offset: -30 }, y: { type: 'bottom_anchor', offset: -30 }, anchor_element: 'canvas', }
    this._staticScene.AddMarker(nameMe, markerMe)
    this._name_Me = nameMe

    const scoreBoard = new ScoreBoardGfx(90)
    scoreBoard.Build(nameCpu, nameMe, args.num_segni)
    scoreBoard._infoGfx = { x: { type: 'left_anchor', offset: +30 }, y: { type: 'top_anchor', offset: 10 }, anchor_element: 'canvas', }
    this._staticScene.AddGfxComponent('scoreBoard', scoreBoard)
  }

  on_pl_ev_brisc_new_giocata(args) {
    // args: {carte: Array(3), brisc: "_5s", num_card_deck: 33}
    // carte: (3) ["_Rc", "_5c", "_Cd"]
    console.log('on_pl_ev_brisc_new_giocata', args)
    this._staticScene.clear_component('deck')
    this._staticScene.clear_component('cardsme')
    this._staticScene.clear_component('cardsopp')
    this._staticScene.clear_component('table')
    this._staticScene.clear_component('deck_taken_opp')
    this._staticScene.clear_component('deck_taken_me')

    const deck = new DeckGfx(80, this._cache, this._deck_info)
    deck.Build(args.num_card_deck, args.brisc)
    deck._infoGfx = { x: { type: 'left_anchor', offset: 20 }, y: { type: 'center_anchor_vert', offset: 0 }, anchor_element: 'canvas', }
    this._staticScene.AddGfxComponent('deck', deck)

    let cards_me = new CardsPlayerGfx(70, this._deck_info, this._cache)
    cards_me.Build(args.carte.length, args.carte, 'normal')
    cards_me._infoGfx = { x: { type: 'center_anchor_horiz', offset: 0 }, y: { type: 'bottom_anchor', offset: -30 }, anchor_element: 'canvas', }
    this._staticScene.AddGfxComponent('cardsme', cards_me)

    let cards_opp = new CardsPlayerGfx(70, this._deck_info, this._cache)
    cards_opp.Build(args.carte.length, [], 'compact_small')
    cards_opp._infoGfx = { x: { type: 'center_anchor_horiz', offset: 0 }, y: { type: 'top_anchor', offset: 10 }, anchor_element: 'canvas', }
    this._staticScene.AddGfxComponent('cardsopp', cards_opp)

    let table = new TableCardsPlayedGfx(60, this._deck_info, this._cache)
    table.Build(['nord', 'sud'], 'circular')
    table._infoGfx = { x: { type: 'center_anchor_horiz', offset: 0 }, y: { type: 'center_anchor_vert', offset: -30 }, anchor_element: 'canvas', }
    this._staticScene.AddGfxComponent('table', table)

    const deck_taken_opp = new DeckTakenGfx(350, this._cache)
    deck_taken_opp.Build(this._deck_info.get_numofcards_ondeck(), 'nord')
    deck_taken_opp._infoGfx = { x: { type: 'left_anchor', offset: 0 }, y: { type: 'bottom_anchor_rel', offset: 90 }, anchor_element: `MKR-${this._name_Opp}`, }
    this._staticScene.AddGfxComponent('deck_taken_opp', deck_taken_opp)

    let deck_taken_me = new DeckTakenGfx(350, this._cache)
    deck_taken_me.Build(this._deck_info.get_numofcards_ondeck(), 'sud')
    deck_taken_me._infoGfx = { x: { type: 'left_anchor', offset: 0 }, y: { type: 'top_anchor', offset: -10 }, anchor_element: `MKR-${this._name_Me}`, }
    this._staticScene.AddGfxComponent('deck_taken_me', deck_taken_me)

    this.animate_distr_cards(args.carte)

  }

  on_all_ev_new_mano(args) {
    // TEST code
    //this._core_state.suspend_proc_gevents('suspend animation for TEST')
    // TEST end
  }

  on_all_ev_have_to_play(args) {
    //args: {player_on_turn: "Luisa"}
    console.log('on_all_ev_have_to_play', args)
    const marker = this._staticScene.GetMarker(args.player_on_turn)
    marker.OnTurn(true)

    const player_onturn = args.player_on_turn
    if (this._name_Me !== player_onturn) {
      return
    }
    const cards_me_gfx = this._staticScene.get_component('cardsme')
    const subId = cards_me_gfx.OnClick((card_lbl) => {
      console.log('Click rec in handler', card_lbl)
      this._core_caller.play_card(card_lbl)
      cards_me_gfx.UnsubClick(subId)
    })
  }

  on_pl_ev_player_cardnot_allowed(args) {
    //args: hand_player: Array(3), wrong_card: "_3b", player_on_turn: "Mario"}
    console.log('Player has played wrong: ', args)
    throw (new Error(`How could you ever played a wrong card (${args.wrong_card}) ?`))
  }

  on_all_ev_player_has_played(args) {
    // args: {player_name: "Luisa", card_played: Array(1)
    // card_played: [_Ab]
    console.log('on_all_ev_player_has_played ', args)
    const marker = this._staticScene.GetMarker(args.player_name)

    let src_keygfx_comp = 'cardsme'
    if (args.player_name !== this._name_Me) {
      src_keygfx_comp = 'cardsopp'
    }

    const carte = args.card_played
    this.animate_card_played(carte, src_keygfx_comp, marker)
  }

  on_all_ev_mano_end(args) {
    //args: {player_best: "Luisa", carte: Array(2), punti: 5}
    console.log('on_all_ev_mano_end', args)

    let src_keygfx_comp = 'deck_taken_me'
    if (args.player_best !== this._name_Me) {
      src_keygfx_comp = 'deck_taken_opp'
    }
    this.animate_mano_end(args.carte, src_keygfx_comp)
  }

  on_pl_ev_pesca_carta(args) {
    // args: {carte: Array(1)}
    console.log('on_pl_ev_pesca_carta', args)
    const carte = args.carte
    this.animate_pesca_carta(carte)
  }

  on_all_ev_giocata_end(args) {
    console.log('on_all_ev_giocata_end', args)
    // best[0][0] => nome vinc
    // best[0][1] => punti vinc
    // best[1][0] => nome perd
    // best[1][1] => punti perd
    const points_best = args.best[0][1]
    const points_loser = args.best[1][1]
    const name_winner = args.best[0][0]

    const score_board = this._staticScene.get_component('scoreBoard')
    score_board.PlayerWonsSegno(name_winner)

    if (store.state.pl.dialog_gfx_no_blocking) {
      console.log('No dialog to show')
      return
    }

    this._block_for_ask_continue_game = () => { console.log('Dialog giocata end was blocking') }
    let complete_msg = `Il segno è treminato con il punteggio di ${points_best} a ${points_loser}`
    complete_msg += `. Segno vinto da: ${name_winner}`
    store.commit('showDialog', {
      title: 'Giocata finita',
      msg: complete_msg,
      fncb: () => {
        console.log('Try to continue the game', this._block_for_ask_continue_game)
        if (this._block_for_ask_continue_game) {
          console.log('Time to continue with somethingelse')
          this._block_for_ask_continue_game()
          this._block_for_ask_continue_game = null
        }
      }
    })
  }

  on_all_ev_waiting_tocontinue_game(args) {
    console.log('on_all_ev_waiting_tocontinue_game', args)
    if (this._block_for_ask_continue_game) {
      this._block_for_ask_continue_game()
      this._block_for_ask_continue_game = () => { this._core_caller.continue_game() }
    } else {
      console.log('Continue game without wait for user ok')
      this._core_caller.continue_game();
    }
  }

  on_all_ev_match_end(args) {
    console.log('on_all_ev_match_end', args)
    // args.info: 'match_info'
    const match_info = JSON.parse(args.info)
    const winner_name = match_info.winner_name
    const myTilte = 'Partia finita'
    let complete_msg = `Partita terminata e vinta da ${winner_name}`

    if (this._block_for_ask_continue_game) {
      this._block_for_ask_continue_game()
      this._block_for_ask_continue_game = () => {
        // showing the same dilog on closing the previous one is not working, so wait a litle
        setTimeout(() => {
          store.commit('showDialog', {
            title: myTilte,
            msg: complete_msg,
            fncb: () => { console.log('Partita finita') }
          })
        }, 600);
      }
    } else {
      console.log('Show dialog end game directly')
      store.commit('showDialog', {
        title: myTilte,
        msg: complete_msg,
        fncb: () => { console.log('Partita finita') }
      })
    }
  }

  animate_distr_cards(carte) {
    let cards_anim = []
    let fnix = 0
    carte.forEach(card_lbl => {
      // one animation for each cards on hand
      cards_anim.push(() => {
        let aniDistr = AniCards('distr_card', 'deck', 'cardsme', card_lbl, (nn, start_cmp, stop_comp) => {
          let cards_me_gfx = this._staticScene.get_component(stop_comp)
          cards_me_gfx.set_visible(card_lbl)
          fnix++
          cards_anim[fnix]()
        })
        this._staticScene.AddAnimation(aniDistr)
      })
    })

    cards_anim.push(() => {
      console.log('All animations are terminated')
      const cards_me_gfx = this._staticScene.get_component('cardsme')
      cards_me_gfx.Redraw()
      const cards_opp_gfx = this._staticScene.get_component('cardsopp')
      cards_opp_gfx.set_deck_visible() // oppponent doesn't animate
      this._core_state.continue_process_events('after animation new giocata')
    })

    this._core_state.suspend_proc_gevents('suspend animation new giocata')

    cards_anim[fnix]()
  }

  animate_card_played(carte, src_keygfx_comp, marker) {
    let cards_anim = []
    let fnix = 0

    carte.forEach(card_lbl => {
      cards_anim.push(() => {
        console.log('Submit animation for ', card_lbl)
        const aniCardPl = AniCards('card_played', src_keygfx_comp, 'table', card_lbl, (nn, start_cmp, stop_comp) => {
          console.log(`Animation ${nn} on ${card_lbl} is terminated`)
          const table_gfx = this._staticScene.get_component(stop_comp)
          table_gfx.set_visible(card_lbl)
          fnix++
          cards_anim[fnix]()
        })
        this._staticScene.AddAnimation(aniCardPl)
      })
    })

    const aniTitle = 'after animation cards played'
    cards_anim.push(() => {
      console.log('All animations are terminated')
      const comp_gfx = this._staticScene.get_component('table')
      comp_gfx.Redraw()
      marker.OnTurn(false)
      this._core_state.continue_process_events(aniTitle)
    })

    this._core_state.suspend_proc_gevents(aniTitle)

    cards_anim[fnix]()
  }

  animate_mano_end(carte, src_keygfx_comp) {
    let cards_anim = []
    let fnix = 0
    cards_anim.push(() => {
      let aniDistr = AniCards('mano_end_all', 'table', src_keygfx_comp, carte, (nn, start_cmp, stop_comp) => {
        console.log(`Animation ${nn} on  is terminated`)
        fnix++
        cards_anim[fnix]()
      })
      this._staticScene.AddAnimation(aniDistr)
    })

    cards_anim.push(() => {
      // finally continue the core processing
      console.log('All animations are terminated')
      this._core_state.continue_process_events('after animation mano end')
    })

    this._core_state.suspend_proc_gevents('suspend animation mano end')
    console.log('continue the game')
    setTimeout(() => {
      cards_anim[fnix]()
    }, 600);
  }

  animate_pesca_carta(carte) {
    const deckGfx = this._staticScene.get_component('deck')
    let cards_anim = []
    let fnix = 0
    carte.forEach(card_lbl => {
      cards_anim.push(() => {
        let aniDistr = AniCards('pesca_carta', 'deck', 'cardsme', card_lbl, (nn, start_cmp, stop_comp) => {
          let cards_me_gfx = this._staticScene.get_component(stop_comp)
          cards_me_gfx.set_inv_to_card(card_lbl)
          fnix++
          cards_anim[fnix]()
        })
        this._staticScene.AddAnimation(aniDistr)
      })
    })

    cards_anim.push(() => {
      deckGfx.PopCard(this._num_players)
      console.log('Pesca carta animation terminated')
      const cards_me_gfx = this._staticScene.get_component('cardsme')
      cards_me_gfx.Redraw()
      const cards_opp_gfx = this._staticScene.get_component('cardsopp')
      cards_opp_gfx.set_inv_to_deck(carte.length) // oppponent doesn't animate
      this._core_state.continue_process_events('after animation pesca carta')
    })

    this._core_state.suspend_proc_gevents('suspend animation pesca carta')
    cards_anim[fnix]()
  }

  register_abbandona_action() {
    store.commit('modifyGameActionState', {
      id: 1, title: 'Abbandona', enabled: true, 
      ask: {val: true, msg: 'Vuoi davvero abbandonare la partita?', title: 'Importante'},
      fncb: () => {
        console.log('Want to call abbandona from briscola-gfx')
      }
    })
  }
}

