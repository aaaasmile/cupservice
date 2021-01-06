import Helper from '../shared/helper.js'
export class CardsPlayerGfx {
  constructor(z_ord, deck_info, cache) {
    this._sprites = []
    this._container = new PIXI.Container()
    this._clickHandler = []
    this._numCards = 0
    this._z_ord = z_ord
    this._deck_info = deck_info
    this._cache = cache
    this._visibleSprite = []
    this._ani_velocity = 20 // todo main option
    this._emptyTexture = null
    this._textureCards = []
  }

  get_space_x(texture_w, mode) {
    switch (mode) {
      case 'normal':
        return texture_w + 10
      case 'compact_small':
        return 15
      case 'compact':
        return 27
    }
    throw (new Error(`get space x: mode => ${mode} not recognized`))
  }

  resize_sprite(sprite, mode) {
    switch (mode) {
      case 'compact':
      case 'normal':
        return sprite
      case 'compact_small':
        let nw = sprite.width - sprite.width / 3
        let nh = sprite.height - sprite.height / 3
        Helper.ScaleSprite(sprite, nw, nh)
        return
    }
    throw (new Error(`get space x: mode => ${mode} not recognized`))
  }

  Build(numCards, cards, mode) {
    this._numCards = numCards
    if (!mode) {
      mode = 'normal'
    }
    this._mode_display = mode
    let textureCards = []
    let texturePlaceHolder = []
    this._visibleSprite = []
    cards.forEach(card_lbl => {
      let cdt = this._cache.GetTextureFromCard(card_lbl, this._deck_info)
      textureCards.push(cdt)
      this._visibleSprite.push(false)
    });

    for (let index = textureCards.length; index < this._numCards; index++) {
      let cdt = this._cache.GetTextureFromSymbol('cope', this._deck_info)
      texturePlaceHolder.push(cdt)
    }

    const cdtempty = this._cache.GetTextureFromSymbol('vuoto_trasp', this._deck_info)
    this._emptyTexture = cdtempty
    let iniX = 0
    let iniY = 0
    let x = iniX
    let y = iniY

    this._container.removeChildren()
    this._sprites = []
    const space_x = this.get_space_x(cdtempty.width, mode)
    for (let index = 0; index < this._numCards; index++) {
      if (texturePlaceHolder.length <= index) {
        texturePlaceHolder.push(cdtempty)
      }

      const itemTexture = texturePlaceHolder[index];
      let sprite = new PIXI.Sprite(itemTexture)
      this.resize_sprite(sprite, mode)
      if (textureCards.length > index) {
        sprite.cup_data_lbl = textureCards[index].cup_data_lbl
      }
      sprite.position.set(x, y)
      this._sprites.push(sprite)
      this._container.addChild(sprite)
      x += space_x
    }
    this._textureCards = textureCards
  }

  Render(isDirty) {
    if (this._isDirty || isDirty) {
      if (this._sprites.length > 0) {
        let iniX = 0
        let iniY = 0
        let x = iniX
        let y = iniY
        const space_x = this.get_space_x(this._sprites[0].width, this._mode_display)
        for (let index = 0; index < this._numCards; index++) {
          const sprite = this._sprites[index]
          sprite.position.set(x, y)
          x += space_x
        }
      }
    }
    this._isDirty = false
  }

  Redraw() {
    this._isDirty = true
  }

  set_animation_sprite_start(name, data) {
    switch (name) {
      case 'card_played':
        const card_lbl = data
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
            return [sprite]
          }
        }
        break;

      default:
        throw (new Error(`animation not recognized ${name} and data ${data}`))
    }
    throw (new Error(`animation programming error ${name} and data ${data}`))
  }

  set_animation_sprite_target(name, sprite) {
    switch (name) {
      case "distr_card":
        const ix = this._visibleSprite.indexOf(false)
        const s_src = this._sprites[ix]
        sprite.end_x = s_src.x + this._container.x
        sprite.end_y = s_src.y + this._container.y
        return Helper.CalcSpriteVelocity(sprite, this._ani_velocity)
      default:
        throw (new Error(`animation in card player not recognized ${name}`))
    }
  }

  set_deck_visible() {
    for (let index = 0; index < this._sprites.length; index++) {
      this._visibleSprite[index] = true
    }
  }

  set_visible(card_lbl) {
    for (let index = 0; index < this._sprites.length; index++) {
      const sprite = this._sprites[index];
      if (sprite.cup_data_lbl === card_lbl) {
        this._visibleSprite[index] = true
        sprite.texture = this._textureCards[index]
        const old_x = sprite.x
        const old_y = sprite.y
        Helper.ScaleCardSpriteToStdIfNeeded(sprite)
        sprite.x = old_x
        sprite.y = old_y

        return
      }
    }
    throw (new Error(`set_visible on card not found ${card_lbl}`))
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
        sprite.cup_data_lbl = null
        console.log('hide card ', card_lbl, index)
        this._visibleSprite[index] = false
        return
      }
    }
    throw (new Error(`hide_card  card not found ${card_lbl}`))
  }

  UnsubClick(id) {
    this._clickHandler.splice(id)
    if (this._clickHandler.length === 0) {
      for (let index = 0; index < this._sprites.length; index++) {
        const sprite = this._sprites[index];
        sprite.interactive = false
        sprite.removeAllListeners('touchstart')
        sprite.removeAllListeners('mousedown')
      }
    }
  }

  OnClick(funHandler) {
    const len = this._clickHandler.push(funHandler)

    for (let index = 0; index < this._sprites.length; index++) {
      const sprite = this._sprites[index];
      if (!sprite.cup_data_lbl || !this._visibleSprite[index]) {
        continue
      }
      let data = sprite.cup_data_lbl
      sprite.interactive = true
      this.handlePress(data, sprite, 'touchstart')
      this.handlePress(data, sprite, 'mousedown')
    }
    return len - 1
  }

  handlePress(data, sprite, event) {
    sprite.on(event, () => {
      this._clickHandler.forEach(fnItem => {
        fnItem(data)
      });
    })
  }
}

