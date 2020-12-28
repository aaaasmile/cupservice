import { DeckGfx } from '../../gfx/deck-gfx.js'
import { CardsPlayerGfx } from '../../gfx/cards-player-gfx.js'
import { PlayerMarkerGfx } from '../../gfx/player-marker-gfx.js'
import { ScoreBoardGfx } from '../../gfx/scoreboard-gfx.js'
import AniCards from '../../gfx/animation-gfx.js'
import store from '../../../vue/store/index.js'
import { PrepareGameVsCpu } from './core-brisc-base.js'
import { TableCardsPlayedGfx } from '../../gfx/table-cards-played.js'

export class BriscolaGfx {
  constructor(cache, static_scene) {
    this._cache = cache
    this._staticScene = static_scene
    this._deck_info = null
    this._core_state = null
    this._num_players = null
    this._name_Me = ''
  }

  set_core_caller(core_caller){
    this._core_caller = core_caller
  }

  BuildGameVsCpu(opt) {
    let b2core = PrepareGameVsCpu(this, opt)
    this._deck_info = b2core._deck_info
    this._cache.check_deckinfo(this._deck_info)
    this._core_state = b2core._coreStateManager
    return b2core._coreStateManager
  }

  on_all_ev_new_match(args) {
    console.log('on_all_ev_new_match ', args)
    //args: {players: Array(2), num_segni: 2, target_segno: 61}
    //       players: ["Luisa", "Silvio"]
    this._num_players = args.players.length
    const nameCpu = args.players[0]
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

    this.animate_distr_cards(args.carte)

  }

  on_all_ev_have_to_play(args) {
    console.log('on_all_ev_have_to_play', args)
    const player_onturn = args.player_on_turn
    if (this._name_Me !== player_onturn){
      return
    }
    const cards_me_gfx = this._staticScene.get_component('cardsme')
    const subId = cards_me_gfx.OnClick((card_lbl) => {
      console.log('Click rec in handler', card_lbl)
      this._core_caller.play_card(card_lbl)
      cards_me_gfx.UnsubClick(subId)
    })
  }

  on_all_ev_player_has_played(args) {
  }


  on_all_ev_giocata_end(args) {
  }

  on_all_ev_match_end(args) {
  }

  on_all_ev_waiting_tocontinue_game(args) {
  }

  on_pl_ev_pesca_carta(args) {
  }

  on_all_ev_new_mano(args) {
  }

  on_all_ev_mano_end(args) {
  }

  animate_distr_cards(carte) {
    let cards_anim = []
    let fnix = 0
    carte.forEach(card_lbl => {
      // one animation for each cards on hand
      cards_anim.push(() => {
        console.log('Submit animation for ', card_lbl)
        let aniDistr = AniCards('distr_card', 'deck', 'cardsme', (nn, start_cmp, stop_comp) => {
          console.log(`Animation ${nn} on ${card_lbl} is terminated`)
          let cards_me_gfx = this._staticScene.get_component(stop_comp)
          cards_me_gfx.set_visible(card_lbl)
          fnix++
          cards_anim[fnix]()
        })
        this._staticScene.AddAnimation(aniDistr)
      })
    })

    cards_anim.push(() => {
      // finally continue the core processing
      console.log('All animations are terminated')
      let cards_me_gfx = this._staticScene.get_component('cardsme')
      cards_me_gfx.Redraw()
      this._core_state.continue_process_events('after animation new giocata')
    })
    cards_anim[fnix]()

    this._core_state.suspend_proc_gevents('suspend animation new giocata')
  }
}

