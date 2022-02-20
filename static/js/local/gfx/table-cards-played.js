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
    this._emptyTexture = null
    this._mode_display = ''
  }

  Build(positions, mode_display) {
    // positions: ['nord','sud']
    this._numCards = positions.length
    this._mode_display = mode_display
    const cdtempty = this._cache.GetTextureFromSymbol('vuoto_traspfull')
    this._emptyTexture = cdtempty
    this._container.removeChildren()
    this._sprites = []
    for (let index = 0; index < this._numCards; index++) {
      let sprite = new PIXI.Sprite(cdtempty)
      this.resize_sprite(sprite, this._mode_display)
      this.set_circular_sprite_xy(positions[index], sprite)
      this._sprites.push(sprite)
      this._visibleSprite.push(false)
      this._container.addChild(sprite)
    }
  }

  set_circular_sprite_xy(poslbl, sprite) {
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

  resize_sprite(sprite, mode) {
    switch (mode) {
      case 'normal':
        return sprite
      case 'compact_small_maxvisible':
        const nw = sprite.width - sprite.width / 3
        const nh = sprite.height - sprite.height / 3
        Helper.ScaleSprite(sprite, nw, nh)
        return
    }
    throw (new Error(`get space x: mode => ${mode} not recognized`))
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

  set_animation_sprite_start(name, cards) {
    const spritesArr = []
    switch (name) {
      case 'mano_end_all':
        cards.forEach(card_lbl => {
          for (let index = 0; index < this._sprites.length; index++) {
            if (!this._visibleSprite[index]) {
              continue
            }
            const spr_src = this._sprites[index]
            if ((spr_src.cup_data_lbl && spr_src.cup_data_lbl === card_lbl) || !spr_src.cup_data_lbl) {
              const cardTexture = this._cache.GetTextureFromCard(card_lbl, this._deck_info)
              let sprite = new PIXI.Sprite(cardTexture)
              sprite.x = spr_src.x + this._container.x
              sprite.y = spr_src.y + this._container.y
              this.hide_card(card_lbl)
              spritesArr.push(sprite)
            }
          }
        });
        break
      default:
        throw (new Error(`animation not recognized ${name} and data ${data}`))
    }
    return spritesArr

  }

  set_animation_sprite_target(name, sprite, data) {
    switch (name) {
      case "card_played":
        const card_lbl = data
        const ix = this._visibleSprite.indexOf(false)
        const s_src = this._sprites[ix]
        s_src.cup_data_lbl = card_lbl
        sprite.end_x = s_src.x + this._container.x
        sprite.end_y = s_src.y + this._container.y
        //console.log('End x,y for sprite ani ', sprite.end_x, sprite.end_y)
        return Helper.CalcSpriteVelocity(sprite, this._ani_velocity)
      default:
        throw (new Error(`animation in card player not recognized ${name}`))
    }
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

  hide_card(card_lbl) {
    for (let index = 0; index < this._sprites.length; index++) {
      if (!this._visibleSprite[index]) {
        continue
      }
    
      const sprite = this._sprites[index];
      if ((sprite.cup_data_lbl && sprite.cup_data_lbl === card_lbl) || (!sprite.cup_data_lbl)) {
        sprite.texture = this._emptyTexture
        const old_x = sprite.x
        const old_y = sprite.y
        Helper.ScaleCardSpriteToStdIfNeeded(sprite)
        sprite.x = old_x
        sprite.y = old_y
        console.log('hide_table card ', card_lbl)
        this._visibleSprite[index] = false
        return
      }
    }
    throw (new Error(`hide_card  card not found ${card_lbl}`))
  }
}