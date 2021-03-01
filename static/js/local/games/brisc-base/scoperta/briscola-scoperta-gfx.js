import { BriscolaGfx } from '../briscola-gfx.js'
import AniCards from '../../../gfx/animation-gfx.js'
import { CoreBriscolaScoperta } from './briscola-scoperta-core.js'
import { AlgBriscScoperta } from './briscola-scoperta-alg.js'

export class BriscolaScopertaGfx extends BriscolaGfx {
  constructor(cache, static_scene) {
    super(cache, static_scene)
  }

  get_core_instance(coreStateManager, numOfSegni, pointsForWin, numcardsOnHand, max_points) {
    return new CoreBriscolaScoperta(coreStateManager, numOfSegni, pointsForWin, numcardsOnHand, max_points)
  }

  get_alg_core(name, deckinfo, level) {
    return new AlgBriscScoperta(name, deckinfo, level)
  }

  animate_distr_cards(carte) {
    console.log('scuperta distr carte...')
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

}