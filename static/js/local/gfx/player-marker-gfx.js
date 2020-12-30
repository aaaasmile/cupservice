export class PlayerMarkerGfx {
  constructor(z_ord, cache) {
    this._container = new PIXI.Container()
    this._sprite = null
    this._text = null
    this._rectangle = null
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

    const rectangle = PIXI.Sprite.from(PIXI.Texture.WHITE);
    rectangle.width = this._text.width;
    rectangle.height = 7;
    rectangle.tint = 0xFF2211;
    rectangle.position.y = this._text.height + 5
    rectangle.position.x = this._text.x
    this._rectangle = rectangle
    this._rectangle.visible = false
    this._container.addChild(rectangle)
    this._isDirty = true
    return this._container
  }

  OnTurn(state){
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