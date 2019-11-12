export class StaticSceneGfx {
  constructor() {
    this.backSprite = null
    this.container = null
  }

  Build(backTexture, viewWidth, viewHeight) {
    this.backSprite = new PIXI.Sprite(backTexture)
    //this.container.addChild(this.backSprite)
    //this.scaleContainer(viewWidth, viewHeight)
    var containerSize = { x: viewWidth, y: viewHeight };
    var slide = background(containerSize, this.backSprite, 'cover');
    this.container = slide.container
    return this.container
  }

  scaleContainer(viewHeight, viewWidth) {
    this.backSprite.anchor.set(0.5, 0.5)
    //this.backSprite.anchor.set(0.5, 0.5)
    this.backSprite.scale.y = viewHeight / this.backSprite.height;
    //this.backSprite.scale.x = viewWidth / this.backSprite.width;
    this.backSprite.scale.x = this.backSprite.scale.y
    // TODO: correggi lo scale che non va a modo

    //this.container.scale.set(0.5, 0.5)
    console.log('Scale back is ', this.container.scale.y, viewHeight, this.backSprite.height, viewWidth, this.backSprite.width)
  }
}

function background(bgSize, inputSprite, type, forceSize) {
  var sprite = inputSprite;
  var bgContainer = new PIXI.Container();
  //var mask = new PIXI.Graphics().beginFill(0x8bc5ff).drawRect(0, 0, bgSize.x, bgSize.y).endFill();
  //bgContainer.mask = mask;
  //bgContainer.addChild(mask);
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