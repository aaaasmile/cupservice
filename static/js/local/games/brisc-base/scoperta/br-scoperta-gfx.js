import { BriscolaGfx } from '../briscola-gfx.js'
import AniCards from '../../../gfx/animation-gfx.js'
import { CoreBriscolaScoperta } from './br-scoperta-core.js'
import { AlgBriscScoperta } from './br-scoperta-alg.js'
import { CardsPlayerGfx } from '../../../gfx/cards-player-gfx.js'

export class BriscolaScopertaGfx extends BriscolaGfx {
  constructor(cache, static_scene, screen_mode) {
    super(cache, static_scene, screen_mode)
  }

  get_core_instance(coreStateManager, numOfSegni, pointsForWin, numcardsOnHand, max_points) {
    return new CoreBriscolaScoperta(coreStateManager, numOfSegni, pointsForWin, numcardsOnHand, max_points)
  }

  get_alg_core(name, deckinfo, level) {
    return new AlgBriscScoperta(name, deckinfo, level)
  }

  on_pl_ev_brisc_new_giocata(args) {
    console.log('Scoperta gfx on_pl_ev_brisc_new_giocata')
    super.on_pl_ev_brisc_new_giocata(args)

    this._staticScene.clear_component('cardsopp')
    const cards_opp = new CardsPlayerGfx(70, this._deck_info, this._cache)
    cards_opp.Build(args.carte_opp.length, args.carte_opp, 'normal') //'normal_x_small_y')
    cards_opp._infoGfx = { x: { type: 'center_anchor_horiz', offset: 0 }, y: { type: 'top_anchor', offset: 10 }, anchor_element: 'canvas', }
    this._staticScene.AddGfxComponent('cardsopp', cards_opp)
  }

  animate_distr_cards(args) {
    console.log('scuperta distr carte...')
    const carte_me = args.carte
    const carte_opp = args.carte_opp

    let cards_anim = []
    let fnix = 0
    carte_me.forEach(card_lbl => {
      cards_anim.push(() => {
        const aniDistr = AniCards('distr_card', 'deck', 'cardsme', card_lbl, (nn, start_cmp, stop_comp) => {
          const cards_me_gfx = this._staticScene.get_component(stop_comp)
          cards_me_gfx.set_visible(card_lbl)
          fnix++
          cards_anim[fnix]()
        })
        this._staticScene.AddAnimation(aniDistr)
      })
    })

    carte_opp.forEach(card_lbl => {
      cards_anim.push(() => {
        const aniDistr = AniCards('distr_card', 'deck', 'cardsopp', card_lbl, (nn, start_cmp, stop_comp) => {
          const cards_opp_gfx = this._staticScene.get_component(stop_comp)
          cards_opp_gfx.set_visible(card_lbl)
          fnix++
          cards_anim[fnix]()
        })
        this._staticScene.AddAnimation(aniDistr)
      })
    })

    cards_anim.push(() => {
      console.log('All animations are terminated, render final state')
      const cards_me_gfx = this._staticScene.get_component('cardsme')
      cards_me_gfx.Redraw()
      const cards_opp_gfx = this._staticScene.get_component('cardsopp')
      cards_opp_gfx.Redraw()
      const deck = this._staticScene.get_component('deck')
      deck.SetTopVisibleCard(args.top_deck)
      deck.Redraw()
      this._staticScene.AddFinalNtfy( () => {
        console.log('Now we are ready to continue process')
        this._core_state.continue_process_events('after animation new giocata')
      })
    })

    this._core_state.suspend_proc_gevents('suspend animation new giocata')

    cards_anim[fnix]()
  }

  animate_pesca_carta(args) {
    console.log('scuperta peasca carte')
    const carte = args.carte
    const carte_opp = args.carte_opp

    const deckGfx = this._staticScene.get_component('deck')
    let cards_anim = []
    let fnix = 0
    for (let index = 0; index < 2; index++) {
      if ((index === 0 && args.first === this._name_Me) ||
        (index === 1 && args.first === this._name_Opp)) {
        carte.forEach(card_lbl => {
          cards_anim.push(() => {
            let aniDistr = AniCards('pesca_carta', 'deck', 'cardsme', card_lbl,
              (nn, start_cmp, stop_comp) => {
                // animation end
                let cards_me_gfx = this._staticScene.get_component(stop_comp)
                cards_me_gfx.set_inv_to_card(card_lbl)

                fnix++
                cards_anim[fnix]()
              },
              () => {
                // animation start
                deckGfx.PopCard(1)
                if (args.top_deck && (args.first === this._name_Me)) {
                  deckGfx.SetTopVisibleCard(carte_opp[0])
                }
              }
            )

            this._staticScene.AddAnimation(aniDistr)
          })
        })
      }
      if ((index === 0 && args.first === this._name_Opp) ||
        (index === 0 && args.first === this._name_Me)) {
        carte_opp.forEach(card_lbl => {
          cards_anim.push(() => {
            const aniDistr = AniCards('pesca_carta', 'deck', 'cardsopp', card_lbl,
              (nn, start_cmp, stop_comp) => {
                // animation end
                const cards_opp_gfx = this._staticScene.get_component(stop_comp)
                cards_opp_gfx.set_inv_to_card(card_lbl)
                fnix++
                cards_anim[fnix]()
              },
              () => {
                // animation start
                deckGfx.PopCard(1)
                if (args.top_deck && (args.first === this._name_Opp)) {
                  deckGfx.SetTopVisibleCard(carte[0])
                }
              }
            )
            this._staticScene.AddAnimation(aniDistr)
          })
        })
      }
    }

    cards_anim.push(() => {
      console.log('Pesca carta animation terminated')
      const cards_me_gfx = this._staticScene.get_component('cardsme')
      cards_me_gfx.Redraw()
      const cards_opp_gfx = this._staticScene.get_component('cardsopp')
      cards_opp_gfx.Redraw()
      const deck = this._staticScene.get_component('deck')
      if (args.top_deck) {
        deck.SetTopVisibleCard(args.top_deck)
      } else {
        deck.Redraw()
      }
      this._core_state.continue_process_events('after animation pesca carta')
    })

    this._core_state.suspend_proc_gevents('suspend animation pesca carta')
    cards_anim[fnix]()
  }
}