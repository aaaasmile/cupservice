import { DeckGfx } from '../../gfx/deck-gfx.js'
import { CardsPlayerGfx } from '../../gfx/cards-player-gfx.js'
import { StaticSceneGfx } from '../../gfx/static-scene-gfx.js'
import { Tink } from '../../app/tink.js'
import { GetMusicManagerInstance } from '../../app/sound-mgr.js'
import { CoreBriscolaBase, PrepareGameVsCpu } from './core-brisc-base.js'
import { CoreStateManager } from '../../core/core-state-manager.js'


export class BriscolaGfx {

  constructor() {
    this._tink = null
  }

  Build(opt, cache, renderer) {
    let tink = new Tink(PIXI, renderer.view)
    let stage = new PIXI.Container()

    let b2core = PrepareGameVsCpu(opt.num_segni)

    // Test static scene
    const staticSceneGfx = new StaticSceneGfx()
    const backTexture = cache.GetTextureFromBackground('table')
    let viewWidth = (renderer.width / renderer.resolution);
    let viewHeight = (renderer.height / renderer.resolution);
    let scContainer = staticSceneGfx.Build(backTexture, viewWidth, viewHeight)
    stage.addChild(scContainer)
    // end

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
    this._tink.update();
  }
}