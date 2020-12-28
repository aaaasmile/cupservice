import { StaticSceneGfx } from './static-scene-gfx.js'
import { GetMusicManagerInstance } from '../app/sound-mgr.js'
import { BriscolaGfx } from '../games/brisc-base/briscola-gfx.js'

export class BuilderGameGfx {

    constructor(game_name) {
        this._core_state = null
        this._staticScene = null
        this._isDirty = false
        this._game_name = game_name
    }

    Build(opt, cache, renderer) {
        let stage = new PIXI.Container()

        const staticSceneGfx = new StaticSceneGfx()
        const backTexture = cache.GetTextureFromBackground('table')
        let viewWidth = (renderer.width / renderer.resolution);
        let viewHeight = (renderer.height / renderer.resolution);
        let scContainer = staticSceneGfx.Build(backTexture, viewWidth, viewHeight)
        stage.addChild(scContainer)

        switch (this._game_name) {
            case 'briscola':
                this.build_briscola(opt, cache, staticSceneGfx)
                break;
            default:
                throw (new Error(`game gfx not supported ${this._game_name}`))
        }

        // // test deck
        // let deckGfx = new DeckGfx();
        // let deckItemTexture = cache.GetTextureFromSymbol('cope')
        // let briscolaTexture = cache.GetTextureFromCard('_5s', b2core._deck_info)
        // let deckContainer = deckGfx.Build(40 - 6 - 1, deckItemTexture, briscolaTexture)
        // deckContainer.position.set(500, 300)
        // stage.addChild(deckContainer)

        // // test hand player
        // let music = GetMusicManagerInstance()
        // let cardsMeGfx = new CardsPlayerGfx(tink)
        // let cardMeContainer = cardsMeGfx.Build(3)
        // const cdT1 = cache.GetTextureFromCard('_Ad', b2core._deck_info)
        // const cdT2 = cache.GetTextureFromCard('_Ad', b2core._deck_info)
        // const cdT3 = cache.GetTextureFromCard('_3d', b2core._deck_info)
        // cardsMeGfx.SetCards([cdT1, cdT2, cdT3], cdT1.width + 5)
        // cardsMeGfx.OnClick((ev) => {
        //   console.log('Click rec in handler', ev)
        //   music.Play('played')
        //   deckGfx.PopCard(2)
        // })
        // cardMeContainer.position.set(20, 300)
        // stage.addChild(cardMeContainer)

        this._staticScene = staticSceneGfx
        this._isDirty = true

        return stage
    }

    Update(delta) {
        this._staticScene.Render(this._isDirty)
        this._staticScene.UpdateAnimations(this._isDirty, delta)
        this._core_state.process_next()
        this._isDirty = false
    }

    build_briscola(opt, cache, staticSceneGfx) {
        console.log('Build briscola gfx')
        const briGfx = new BriscolaGfx(cache, staticSceneGfx)
        this._core_state = briGfx.BuildGameVsCpu(opt)
    }
}