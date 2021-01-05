import Helper from '../shared/helper.js'
export class TableCardsPlayedGfx {
    constructor(z_ord, deck_info, cache) {
        this._sprites = []
        this._container = new PIXI.Container()
        this._clickHandler = new Map()
        this._numCards = 0
        this._z_ord = z_ord
        this._deck_info = deck_info
        this._cache = cache
        this._visibleSprite = []
        this._ani_velocity = 20
    }

    Build(positions, mode) {
        // mode: 'circular'
        // positions: ['nord','sud']
        this._numCards = positions.length
        const cdtempty = this._cache.GetTextureFromSymbol('vuoto_trasp')
        this._container.removeChildren()
        this._sprites = []
        for (let index = 0; index < this._numCards; index++) {
            let sprite = new PIXI.Sprite(cdtempty)
            this.set_sprite_xy(positions[index], mode, sprite)
            this._sprites.push(sprite)
            this._visibleSprite.push(false)
            this._container.addChild(sprite)
        }
    }

    set_sprite_xy(poslbl, mode, sprite) {
        if (mode !== 'circular') {
            throw (new Error(`mode in set_sprite_xy not supported ${mode}`))
        }
        switch (poslbl) {
            case 'nord':
                sprite.x -= 15
                sprite.y -= 10
                break
            case 'sud':
                sprite.x += 15
                sprite.y += 10
                break
            default:
                throw (new Error(`position not supported ${poslbl}`))
        }
    }

    Render(isDirty) {
        if (this._isDirty || isDirty) {
            // nothing to do?
        }
        this._isDirty = false
    }

    Redraw() {
        this._isDirty = true
    }

    set_animation_sprite_target(name, sprite, data) {
        if (name === "card_played") {
            const card_lbl = data
            const ix = this._visibleSprite.indexOf(false)
            const s_src = this._sprites[ix]
            s_src.cup_data_lbl = card_lbl
            sprite.end_x = s_src.x + this._container.x
            sprite.end_y = s_src.y + this._container.y
            //console.log('End x,y for sprite ani ', sprite.end_x, sprite.end_y)
            return Helper.CalcSpriteVelocity(sprite, this._ani_velocity)
        }
        throw (new Error(`animation in card player not recognized ${name}`))
    }

    set_visible(card_lbl) {
        for (let index = 0; index < this._sprites.length; index++) {
            const sprite = this._sprites[index];
            if (sprite.cup_data_lbl === card_lbl) {
                this._visibleSprite[index] = true
                sprite.texture = this._cache.GetTextureFromCard(card_lbl, this._deck_info)
                const old_x = sprite.x
                const old_y = sprite.y
                //console.log('Sprite pos ', old_x, old_y)
                Helper.ScaleCardSpriteToStdIfNeeded(sprite)
                sprite.x = old_x
                sprite.y = old_y

                return
            }
        }
        throw (new Error(`set_visible on table card not found ${card_lbl}`))
    }
}