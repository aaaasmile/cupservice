export class SimpleText {
  constructor(z_ord) {
    this._container = new PIXI.Container()
    this._text = null
    this._isDirty = false
    this.z_ord = z_ord
    this._mode_display = 'normal'
  }

  Build(ver, mode) {
    this._mode_display = mode
    this._text = new PIXI.Text(ver)
    this._text.style = this.get_text_style(mode)
    this._container.addChild(this._text)
    this._text.position.x = this.get_text_posx(mode)
    return this._container
  }

  get_text_posx(mode) {
    switch (mode) {
      case 'normal':
        return 10
      case 'compact_small_maxvisible':
        return 5
    }
    throw (new Error(`get_text_posx: mode => ${mode} not recognized`))
  }

  get_text_style(mode) {
    switch (mode) {
      case 'normal':
        return { fill: "blacke", fontSize: 10 }
      case 'compact_small_maxvisible':
        return { fill: "black", fontSize: 9 }
    }
    throw (new Error(`get_text_style: mode => ${mode} not recognized`))
  }

  Render(isDirty) {
    if (this._isDirty || isDirty) {
    }
    this._isDirty = false
  }
}