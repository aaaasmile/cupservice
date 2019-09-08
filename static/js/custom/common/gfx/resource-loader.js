export class SoundIds {
  static ClickSound = "Click";
  static MixSound = "Mix";
}

export class ImagesIds {
  static Table = "Table";
}

// export class ResourceLoader {
//   constructor(){
//     this.queue = new createjs.LoadQueue(false);
//     this.bitmaps = {};
//   }
  
//   loadResources() {
//     console.log('Start to load resources...')
//     this.queue.installPlugin(createjs.Sound);
//     this.queue.on("complete", (e) => {
//       this.dispatchEvent(e);
//       console.log('All resources loaded');
//     });

//     this.queue.on("fileload", (e) => {
//       console.log('File loaded: ', e);
//     });

//     // NOTA : questa roba sembra non funzionare. Ho usato il card-loader invece.

//     //this.queue.loadFile({ id: SoundIds.ClickSound, src: "/dist/res/sound/click_4bit.wav" });
//     this.queue.loadFile({ id: SoundIds.ClickSound, src: "assets/sound/click_4bit.wav" });
//     //this.queue.loadFile("assets/sound/click_4bit.wav");
//     //this.queue.loadFile({ id: SoundIds.MixSound, src: "assets/sound/mischen1.wav" });
//      this.queue.loadManifest([
//        { id: ImagesIds.Table, src: "assets/images/table/table.png" }
//      ]);
//     this.queue.load()
//   }

//   getImageBitmap(imageID){
//     if (!this.bitmaps[imageID]){
//       this.bitmaps[imageID] = new createjs.Bitmap(this.queue.getResult(imageID));
//     }
//     return this.bitmaps[imageID];
//   }
// }