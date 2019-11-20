export class PlayerMarkerGfx {
  constructor() {
    this._container = new PIXI.Container()
  }

  Build(name, avatarTexture) {
    let sprite = new PIXI.Sprite(avatarTexture)
    let text = new PIXI.Text(name)
    text.style = { fill: "white" }
    this._container.addChild(sprite);
    this._container.addChild(text);

    return this._container
  }
}