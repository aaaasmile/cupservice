import Helper from '../shared/helper.js?version=100'

export class PlayerMarkerGfx {
  constructor(z_ord, cache) {
    this._container = new PIXI.Container()
    this._sprite = null
    this._text = null
    this._rectangle = null
    this._isDirty = false
    this.z_ord = z_ord
    this._cache = cache
    this._mode_display = 'normal'
  }

  Build(name, avatar_name, mode) {
    this._mode_display = mode
    const avatarTexture = this._cache.GetTextureFromAvatar(avatar_name)
    const sprite = new PIXI.Sprite(avatarTexture)
    this.resize_sprite(sprite, this._mode_display)
    this._text = new PIXI.Text(name)
    this._text.style = this.get_text_style(mode)
    this._container.addChild(sprite)
    this._container.addChild(this._text)
    this._text.position.x = this.get_text_posx(sprite, mode)
    this._sprite = sprite

    const rectangle = PIXI.Sprite.from(PIXI.Texture.WHITE)
    rectangle.width = this._text.width
    rectangle.height = 7
    rectangle.tint = 0xFF2211
    rectangle.position.y = this._text.height + 5
    rectangle.position.x = this._text.x
    this._rectangle = rectangle
    this._rectangle.visible = false
    this._container.addChild(rectangle)
    this._isDirty = true
    return this._container
  }

  get_text_posx(sprite, mode) {
    switch (mode) {
      case 'normal':
        return sprite.width + 10
      case 'compact_small_maxvisible':
        return sprite.width + 5
    }
    throw (new Error(`get_text_posx: mode => ${mode} not recognized`))
  }

  get_text_style(mode) {
    switch (mode) {
      case 'normal':
        return { fill: "white" }
      case 'compact_small_maxvisible':
        return { fill: "white", fontSize: 10 }
    }
    throw (new Error(`get_text_style: mode => ${mode} not recognized`))
  }

  resize_sprite(sprite, mode) {
    switch (mode) {
      case 'normal':
        return sprite
      case 'compact_small_maxvisible':
        const nw = sprite.width - sprite.width / 2
        const nh = sprite.height - sprite.height / 2
        Helper.ScaleSprite(sprite, nw, nh)
        return
    }
    throw (new Error(`resize_sprite: mode => ${mode} not recognized`))
  }

  OnTurn(state) {
    this._rectangle.visible = state
    this._isDirty = true
  }

  Render(isDirty) {
    if (this._isDirty || isDirty) {
      //console.log('*** render the marker ...')  
    }
    this._isDirty = false
  }
}