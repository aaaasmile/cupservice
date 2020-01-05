export class PlayerMarkerGfx {
  constructor(z_ord) {
    this._container = new PIXI.Container()
    this._sprite = null
    this._text = null
    this._isDirty = false
    this.z_ord = z_ord
  }

  Build(name, avatarTexture) {
    this._sprite = new PIXI.Sprite(avatarTexture)
    this._text = new PIXI.Text(name)
    this._text.style = { fill: "white" }
    this._container.addChild(this._sprite);
    this._container.addChild(this._text);
    this._isDirty = true
    return this._container
  }

  Render(isDirty){
    if (this._isDirty || isDirty){
      console.log('*** render the marker ...')
      this._text.position.x = this._sprite.width + 10
    }
    this._isDirty = false
  }
}