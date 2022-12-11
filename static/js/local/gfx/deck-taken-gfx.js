import Helper from '../shared/helper.js?version=100'

export class DeckTakenGfx {
  constructor(z_ord, cache) {
    this._container = new PIXI.Container()
    this._deckSprite = []
    this._last_toshow = []
    this._deckEmpty = null
    this._taken_lbl = []

    this._isDirty = false
    this.z_ord = z_ord
    this._cache = cache
    this._max_cards = 0
    this._ani_velocity = 20 // to do main option
    this._position = null
    this._copeTexture = null
    this._last_x = 0
    this._last_y = 0
    this._show_x = 0
    this._show_y = 0
    this._mode_display = 'normal'
  }

  Build(max_cards, position, mode) {
    this._mode_display = mode
    this._position = position
    this.set_position(this._mode_display)
    this._max_cards = max_cards
    const cdtempty = this._cache.GetTextureFromSymbol('vuoto_traspfull')

    const cdt = this._cache.GetTextureFromSymbol('cope', this._deck_info)
    this._copeTexture = cdt

    const sprite = new PIXI.Sprite(cdtempty)
    this.resize_sprite(sprite, this._mode_display)
    sprite.rotation = - Math.PI / 2.0

    this._deckEmpty = sprite
    this._container.addChild(sprite);
    this._isDirty = true
    return this._container
  }

  Render(isDirty) {
    if (this._isDirty || isDirty) {
    }
    this._isDirty = false
  }

  set_position(mode) {
    switch (mode) {
      case 'normal':
        switch (this._position) {
          case 'nord':
            this._last_y = -20
            this._last_x = -2
            this._show_x = -20
            break;
          case 'sud':
            this._last_y = -10
            this._last_x = -2
            this._show_y = -170
            this._show_x = -20
            break;
          default:
            throw (new Error(`Player position not suppported: ${this._position}`))
        }
        return
      case 'compact_small':
        switch (this._position) {
          case 'nord':
            this._last_y = -20
            this._last_x = -2
            this._show_x = -5
            break;
          case 'sud':
            this._last_y = -10
            this._last_x = -2
            this._show_y = -100
            this._show_x = -5
            break;
          default:
            throw (new Error(`Player position not suppported: ${this._position}`))
        }    
        return
    }
    throw (new Error(`set_position: mode => ${mode} not recognized`))
  }

  resize_sprite(sprite, mode) {
    switch (mode) {
      case 'normal':
        Helper.ScaleSprite(sprite, 50, 50)
        return sprite
      case 'compact_small':
        Helper.ScaleSprite(sprite, 30, 30)
        return sprite
    }
    throw (new Error(`resize_sprite: mode => ${mode} not recognized`))
  }

  take_cards(cards) {
    // cards: ['_Ab', '_Cs']
    console.log('Cards taken are: ', cards)
    if (this._deckEmpty) {
      this._deckEmpty.visible = false
      this._deckEmpty = null

      this.add_one_cope()
    }
    let x = 0
    const rescale = (this._taken_lbl.length === 0)
    const offset_x = this.get_offset_x(this._mode_display)
    this.set_position(this._mode_display)
    for (let index = 0; index < cards.length; index++) {
      const card_lbl = cards[index]
      if (this._last_toshow.length <= index) {
        const sprite = new PIXI.Sprite()
        this._last_toshow.push(sprite)
        this._container.addChild(sprite);
      }
      const cdt = this._cache.GetTextureFromCard(card_lbl, this._deck_info)
      let sprite_lastshow = this._last_toshow[index]
      sprite_lastshow.texture = cdt
      if (rescale) {
        sprite_lastshow = this.resize_sprite(sprite_lastshow, this._mode_display)
      }

      sprite_lastshow.position.set(this._show_x + x, this._show_y)
      sprite_lastshow.visible = false
      x += sprite_lastshow.width + offset_x

      this._last_toshow[index] = sprite_lastshow
      this._taken_lbl.push(card_lbl)
    }
    if (this.check_to_add_cope(this._mode_display)) {
      this.add_one_cope()
    }
  }

  get_offset_x(mode) {
    switch (mode) {
      case 'normal':
        return 15
      case 'compact_small':
        return 3
    }
    throw (new Error(`check_to_add_cope: mode => ${mode} not recognized`))
  }

  check_to_add_cope(mode) {
    switch (mode) {
      case 'normal':
        return (this._taken_lbl.length / 5 > this._deckSprite.length)
      case 'compact_small':
        return false
    }
    throw (new Error(`check_to_add_cope: mode => ${mode} not recognized`))
  }

  add_one_cope() {
    console.log('Add one coperto to the stack with size', this._deckSprite.length)
    for (let index = 0; index < this._deckSprite.length; index++) {
      const ss = this._deckSprite[index];
      ss.interactive = false
    }

    let sprite = new PIXI.Sprite(this._copeTexture)
    sprite = this.resize_sprite(sprite, this._mode_display)
    sprite.rotation = - Math.PI / 2.0
    sprite.position.set(this._last_x, this._last_y)

    sprite.interactive = true
    sprite.on('mousedown', () => { this.show_last_take() })
    sprite.on('touchstart', () => { this.show_last_take() })

    this._deckSprite.push(sprite)
    this._container.addChild(sprite);
    this._last_x += 2
    this._last_y += 2
    this._isDirty = true
  }

  show_last_take() {
    this._last_toshow.forEach(ss_tk => {
      ss_tk.visible = !ss_tk.visible
      if (ss_tk.visible) {
        setTimeout(() => {
          ss_tk.visible = false
        }, 1500)
      }
      this._isDirty = true
    });
  }

  set_animation_sprite_target(name, sprite, data, canvas_w, canvas_h) {
    switch (name) {
      case "mano_end_all":
        switch (this._position) {
          case 'nord':
            sprite.end_x = sprite.x
            sprite.end_y = 0
            sprite = Helper.CalcSpriteVelocityIncremental(sprite, this._ani_velocity, 1)
            break;
          case 'sud':
            sprite.end_x = sprite.x
            sprite.end_y = canvas_h
            sprite = Helper.CalcSpriteVelocityIncremental(sprite, this._ani_velocity, 0.8)
            break;
          default:
            throw (new Error(`Player position not suppported: ${this._position}`))
        }

        //console.log('** ani mano_end_all ', sprite.end_x, sprite.end_y)

        return sprite
      default:
        throw (new Error(`animation in card player not recognized ${name}`))
    }
  }

}