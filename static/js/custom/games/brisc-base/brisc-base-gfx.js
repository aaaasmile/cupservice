export class BriscBaseGfx {
  constructor() {
    console.log('BriscBaseGfx created')
  }

  renderScene(canvid) {
    console.log('BriscBaseGfx render scene', canvid)
    this.canvasNode = document.getElementById(canvid)
    this.waitUntilCanvasReady(10, canvid, () => {
      console.log('Canvas is ready', this.canvasNode)
    })

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
      if (!this.canvasNode) {
        this.waitUntilCanvasReady(time + 10, canvid, cb_ready)
      }
    }, time)
  }
}