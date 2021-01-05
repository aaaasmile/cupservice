import Helper from '../shared/helper.js'

export class DeckTakenGfx {
    constructor(z_ord, cache) {
        this._container = new PIXI.Container()
        this._deckSprite = []

        this._isDirty = false
        this.z_ord = z_ord
        this._cache = cache
        this._max_cards = 0
    }

    Build(max_cards) {
        this._max_cards = max_cards
        const cdtempty = this._cache.GetTextureFromSymbol('vuoto_trasp')
        const sprite = new PIXI.Sprite(cdtempty)
        
        Helper.ScaleSprite(sprite, 50, 50)
        sprite.rotation = - Math.PI / 2.0

        this._deckSprite.push(sprite)
        this._container.addChild(sprite);
        this._isDirty = true
        return this._container
    }

  
    Render(isDirty) {
        if (this._isDirty || isDirty) {
        }
        this._isDirty = false
    }
}