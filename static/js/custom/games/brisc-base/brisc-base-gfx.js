export class BriscBaseGfx {
  constructor() {
    console.log('BriscBaseGfx created')
  }

  renderScene(canvid) {
    console.log('BriscBaseGfx render scene', canvid)
    this.canvasNode = document.getElementById(canvid)
    this.waitUntilCanvasReady(10, canvid, () => {
      console.log('Canvas is ready', this.canvasNode)
      this.testSomeCanvas(canvid)
    })

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

    // this.imgTmp = new Image();
    // this.imgTmp.src = "assets/carte/piac/01_denar.png";
    // //this.imgTmp.onload = this.imageLoaded;
    // this.imgTmp.onload = () => {
    //   console.log('Example image Loaded');
    //   let card = new createjs.Bitmap(this.imgTmp);
    //   //card.x = 30;
    //   //card.y = 20;
    //   this.mainStage.addChild(card);
    //   this.mainStage.update();
    // }

    // let card = new createjs.Bitmap("/dist/res/carte/piac/01_denar.png");
    // card.x = 30;
    // card.y = 20;
    // this.mainStage.addChild(card);

    this.mainStage.update();
  }

  waitUntilCanvasReady(time, canvid, cb_ready) {
    if(this.canvasNode){
      cb_ready()
      return
    }
    console.log('canvas not set, waitUntilCanvasReady time', time)
    setTimeout(() => {
      this.canvasNode = document.getElementById(canvid);
      console.log('Canvas node is', this.canvasNode)
      if (this.canvasNode) {
        cb_ready()
      }else{
        this.waitUntilCanvasReady(time + 10, canvid, cb_ready)
      }
    }, time)
  }
}