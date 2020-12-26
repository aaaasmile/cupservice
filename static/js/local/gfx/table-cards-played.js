import Helper from '../shared/helper.js'
export class TableCardsPlayedGfx {
    constructor(z_ord, tink, deck_info, cache) {
        this._sprites = []
        this._container = new PIXI.Container()
        this._clickHandler = new Map()
        this._numCards = 0
        this._z_ord = z_ord
        this._tink = tink
        this._deck_info = deck_info
        this._cache = cache
        this._visibleSprite = []
        this._ani_velocity = 20
    }

    Build(positions, mode) {
        // mode: 'circular'
        // positions: ['nord','sud']
        const numCards = positions.length
        this._numCards = numCards
        const cdtempty = this._cache.GetTextureFromSymbol('vuoto_trasp', this._deck_info)
        this._container.removeChildren()
        this._sprites = []
        for (let index = 0; index < numcards; index++) {
            let sprite = new PIXI.Sprite(cdtempty)
            this.set_sprite_xy(positions[index], mode, sprite)
            this._sprites.push(sprite)
            this._container.addChild(sprite)
        }
    }

    set_sprite_xy(poslbl, mode, sprite){
        if (mode !== 'circular'){
            throw(new Error(`mode in set_sprite_xy not supported ${mode}`))
        }
        switch(poslbl){
            case 'nord':
                sprite.x -= 15
                sprite.y -= 10
            case 'sud':
                sprite.x += 15
                sprite.y += 10
            default:
                throw(new Error(`position not supported ${poslbl}`))
        }
    }

    Render(isDirty) {
        if (this._isDirty || isDirty) {
        }
        this._isDirty = false
      }
    

}