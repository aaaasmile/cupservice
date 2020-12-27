import Helper from '../shared/helper.js'
export class CardsPlayerGfx {
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
      //console.log('*** render cards player ...')
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

  Redraw(){
    this._isDirty = true
  }

  set_animation_sprite_target(name, sprite) {
    if (name === "distr_card") {
      const ix = this._visibleSprite.indexOf(false)
      const s_src = this._sprites[ix]
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
        sprite.texture = this._textureCards[index]
        const old_x = sprite.x
        const old_y = sprite.y
        //console.log('Sprite pos ', old_x, old_y)
        Helper.ScaleCardSpriteToStdIfNeeded(sprite)
        sprite.x = old_x
        sprite.y = old_y

        return
      }
    }
    throw (new Error(`set_visible on card not found ${card_lbl}`))
  }

  OnClick(funHandler) {
    const event = 'click-card'
    this._clickHandler.set(event, funHandler)

    for (let index = 0; index < this._sprites.length; index++) {
      const sprite = this._sprites[index];
      let data = sprite.cup_data_lbl
      this._tink.makeInteractive(sprite);
      this.handlePress(event, data, sprite)
    }
  }

  handlePress(event, data, sprite) {
    sprite.press = () => {
      console.log('Card is pressed')
      //sprite.enabled = false // remove the interactivity
      //sprite.visible = false
      if (this._clickHandler.has(event)) {
        this._clickHandler.get(event)(data)
      }
    }
  }
}

