export class PlayerMarkerGfx {
  constructor(z_ord, cache) {
    this._container = new PIXI.Container()
    this._sprite = null
    this._text = null
    this._isDirty = false
    this.z_ord = z_ord
    this._cache = cache
  }

  Build(name, avatar_name) {
    const avatarTexture = this._cache.GetTextureFromAvatar(avatar_name)
    this._sprite = new PIXI.Sprite(avatarTexture)
    this._text = new PIXI.Text(name)
    this._text.style = { fill: "white" }
    this._container.addChild(this._sprite);
    this._container.addChild(this._text);
    this._text.position.x = this._sprite.width + 10

    this._isDirty = true
    return this._container
  }

  Render(isDirty) {
    if (this._isDirty || isDirty) {
      //console.log('*** render the marker ...')  
    }
    this._isDirty = false
  }
}