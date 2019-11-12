export class StaticSceneGfx {
  constructor() {
    this.backSprite = null
    this.container = null
  }

  Build(backTexture, viewWidth, viewHeight) {
    this.backSprite = new PIXI.Sprite(backTexture)
    this.container = new PIXI.Container()
    this.container.addChild(this.backSprite)
    //this.scaleContainer(viewWidth, viewHeight)
    //var containerSize = { x: viewWidth, y: viewHeight };
    //var slide = background(containerSize, this.backSprite, 'cover');
    //this.container = slide.container
    this.scaleContainer(this.backSprite, viewWidth, viewHeight)

    return this.container
  }

  scaleContainer(sprite, viewWidth, viewHeight) {
    let winratio = viewWidth / viewHeight
    let spratio = sprite.width / sprite.height
    let scale = 1
    let pos = new PIXI.Point(0, 0)
    if (winratio > spratio) {
      scale = viewWidth / sprite.width
      pos.y = -((sprite.height * scale) - viewHeight) / 2
    } else {
      scale = viewHeight / sprite.height
      pos.x = -((sprite.width * scale) - viewWidth) / 2
    }
    sprite.scale = new PIXI.Point(scale, scale);
    sprite.position = pos
  }
}

function background(bgSize, inputSprite, type, forceSize) {
  var sprite = inputSprite;
  var bgContainer = new PIXI.Container();
  bgContainer.addChild(sprite);

  function resize() {
    var sp = { x: sprite.width, y: sprite.height };
    if (forceSize) sp = forceSize;
    var winratio = bgSize.x / bgSize.y;
    var spratio = sp.x / sp.y;
    var scale = 1;
    var pos = new PIXI.Point(0, 0);
    if (type == 'cover' ? (winratio > spratio) : (winratio < spratio)) {
      //photo is wider than background
      scale = bgSize.x / sp.x;
      pos.y = -((sp.y * scale) - bgSize.y) / 2
    } else {
      //photo is taller than background
      scale = bgSize.y / sp.y;
      pos.x = -((sp.x * scale) - bgSize.x) / 2
    }

    sprite.scale = new PIXI.Point(scale, scale);
    sprite.position = pos;
  }

  resize();

  return {
    container: bgContainer,
    doResize: resize
  }
}