import { DeckGfx } from '../../gfx/deck-gfx.js'
import { CardsPlayerGfx } from '../../gfx/cards-player-gfx.js'
import { StaticSceneGfx } from '../../gfx/static-scene-gfx.js'
import { Tink } from '../../app/tink.js'
import { GetMusicManagerInstance } from '../../app/sound-mgr.js'
import { PrepareGameVsCpu } from './core-brisc-base.js'
import { PlayerMarkerGfx } from '../../gfx/player-marker-gfx.js'


class BriscAlgGfx {
  constructor(cache, static_scene){
    this._cache = cache
    this._staticScene = static_scene
  }

  on_all_ev_new_match(args) {
    console.log('on_all_ev_new_match ', args)
    //args: {players: Array(2), num_segni: 2, target_segno: 61}
    //       players: ["Ernesto", "Luigi"]
    const cpuTexture = this._cache.GetTextureFromAvatar('stevie')
    const nameCpu = args.players[0]
    const markerCpu = new PlayerMarkerGfx()
    let cpuCont = markerCpu.Build(nameCpu, cpuTexture)
    cpuCont.markerCpu = markerCpu
    //cpuCont.position.set(10,10)
    // TODO: let info = { x: 0, y: 20, anchor_element: 'canvas', x_type: 'center_anchor_horiz'}
    this._staticScene.AddMarker(nameCpu, cpuCont)
  }

  on_pl_ev_brisc_new_giocata(args) {
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

  on_all_ev_have_to_play(args) {
  }

  on_all_ev_player_has_played(args) {
  }
}

//aa["info_tag"] = { x: 23, y:34, anchor_element: 'canvas', x_type: 'left_anchor'}


////////////////////////////////////////////////////////////////////////////////////

export class BriscolaGfx {

  constructor() {
    this._tink = null
    this._core_state = null
  }

  Build(opt, cache, renderer) {
    let tink = new Tink(PIXI, renderer.view)
    let stage = new PIXI.Container()

    // Test static scene
    const staticSceneGfx = new StaticSceneGfx()
    const backTexture = cache.GetTextureFromBackground('table')
    let viewWidth = (renderer.width / renderer.resolution);
    let viewHeight = (renderer.height / renderer.resolution);
    let scContainer = staticSceneGfx.Build(backTexture, viewWidth, viewHeight)
    stage.addChild(scContainer)
    // end

    const algGfx = new BriscAlgGfx(cache, staticSceneGfx)
    let b2core = PrepareGameVsCpu(algGfx, opt)
    this._core_state = b2core._coreStateManager

    // test deck
    let deckGfx = new DeckGfx();
    let deckItemTexture = cache.GetTextureFromSymbol('cope')
    let briscolaTexture = cache.GetTextureFromCard('_5s', b2core._deck_info)
    let deckContainer = deckGfx.Build(40 - 6 - 1, deckItemTexture, briscolaTexture)
    deckContainer.position.set(500, 300)
    stage.addChild(deckContainer)

    // test hand player
    let music = GetMusicManagerInstance()
    let cardsMeGfx = new CardsPlayerGfx(tink)
    let cardMeContainer = cardsMeGfx.Build(3)
    const cdT1 = cache.GetTextureFromCard('_Ad', b2core._deck_info)
    const cdT2 = cache.GetTextureFromCard('_Ad', b2core._deck_info)
    const cdT3 = cache.GetTextureFromCard('_3d', b2core._deck_info)
    cardsMeGfx.SetCards([cdT1, cdT2, cdT3], cdT1.width + 5)
    cardsMeGfx.OnClick((ev) => {
      console.log('Click rec in handler', ev)
      music.Play('played')
      deckGfx.PopCard(2)
    })
    cardMeContainer.position.set(20, 300)
    stage.addChild(cardMeContainer)

    this._tink = tink

    return stage
  }

  Update(delta) {
    this._core_state.process_next()
    this._tink.update();
  }
}