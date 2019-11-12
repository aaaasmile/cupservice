import * as snd from './sound.js'


export class MusicManager{
  constructor(){
    this._sound = snd.sounds
  }
  Init(cbLoaded){
    this._sound.load([
      "static/assets/sound/mischen1.wav", 
      "static/assets/sound/click_4bit.wav"
    ]);
    this._sound.whenLoaded = () => {
      console.log('Sounds loaded OK')
      cbLoaded()
    }
  }
  Play(name){
    let piece
    switch (name){
      case 'mix':
        piece = this._sound["static/assets/sound/mischen1.wav"] 
        break;
      case 'played':
        piece = this._sound["static/assets/sound/click_4bit.wav"] 
        break;
    }
    if(piece){
      piece.play()
    }else{
      console.error('Sound unavailable: ', name)
    }
  }
}

let instance
export function GetMusicManagerInstance() {
  if(!instance){
    instance = new MusicManager()
  }
  return instance
}