import { GetCardLoaderGfx } from '../../common/gfx/card-loader_gfx.js'

export class BriscBaseGfx {
  constructor() {
    console.log('BriscBaseGfx created')
    this.opt = {
      deck_name: 'piac'
    }
  }

  renderScene(canvid) {
    console.log('BriscBaseGfx render scene', canvid)
    this.canvasNode = document.getElementById(canvid)
    this.waitUntilCanvasReady(10, canvid, () => {
      console.log('Canvas is ready', this.canvasNode)
      //this.testSomeCanvas(canvid)
      this.initScene(canvid)
    })
  }

  initScene(canvid) {
    console.log('Init scene')
    this.mainStage = new createjs.Stage(canvid);
    let canvas = this.mainStage.canvas
    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    canvas.width = width;
    canvas.height = height;


    let cardLoader = GetCardLoaderGfx()
    let cache = cardLoader.getLoaded(this.opt.deck_name)
    if (cache) {
      this.resourceLoadCompleted(cache)
    } else {
      this.loadImages(cardLoader, this.opt.deck_name)
    }

  }

  loadImages(cardLoader, deck_name) {
    let loaderGfx = cardLoader.getProgressGfx(this.mainStage.canvas)
    console.log("Load images for ", deck_name)
    this.mainStage.addChild(loaderGfx.loaderBar);
    createjs.Ticker.framerate = 30;

    let totItems = -1
    let that = this
    cardLoader.loadResources(deck_name)
      .subscribe(x => {
        if (totItems === -1) {
          totItems = x
          console.log("Expect total items to load: ", x)
          return
        }
        //console.log("Next loaded is ", x, loaderGfx.bar.scaleX)
        // scaleX semplicemante sposta la nuova x nel rect
        loaderGfx.bar.scaleX = (x * loaderGfx.loaderWidth) / totItems;
        this.mainStage.update();
      },
        (err) => {
          console.error("Load error", err)
        }, () => {
          console.log("Load Completed!")
          let cache = cardLoader.getLoaded(deck_name)
          loaderGfx.loaderBar.alpha = 1;
          createjs.Tween.get(loaderGfx.loaderBar).wait(500).to({ alpha: 0, visible: false }, 500)
            .call(handleComplete)
            .on("change", x => { that.mainStage.update() })
          function handleComplete() {
            //Tween complete
            console.log("Tween complete")
            that.resourceLoadCompleted(cache)
          }

        })

  }

  resourceLoadCompleted(cache) {
    this.images = cache
    cache.add_background(this.mainStage)
    //this.mainStage.addChild(cache.scene_background)
    //this.mainStage.addChild(cache.printDeck())
    this.mainStage.update();
  }

  testSomeCanvas(canvid) {
    console.log('Canvas initialization');
    this.mainStage = new createjs.Stage(canvid);
    var circle = new createjs.Shape();
    circle.graphics.beginFill("DeepSkyBlue").drawCircle(0, 0, 50);
    circle.x = 100;
    circle.y = 100;
    this.mainStage.addChild(circle);

    var title = new createjs.Text();
    title.text = 'Briscola Rocks!';
    title.font = '14px Georgia';
    title.color = 'black';
    title.x = 10;
    title.y = 10;
    this.mainStage.addChild(title);
    this.mainStage.update();
  }

  waitUntilCanvasReady(time, canvid, cb_ready) {
    if (this.canvasNode) {
      cb_ready()
      return
    }
    console.log('canvas not set, waitUntilCanvasReady time', time)
    setTimeout(() => {
      this.canvasNode = document.getElementById(canvid);
      console.log('Canvas node is', this.canvasNode)
      if (this.canvasNode) {
        cb_ready()
      } else {
        this.waitUntilCanvasReady(time + 10, canvid, cb_ready)
      }
    }, time)
  }
}