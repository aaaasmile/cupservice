import * as snd from './sound.js'
import store from '../../vue/store/index.js'

const _assetMusicPath = "static/assets/sound/"
export class MusicManager {
  constructor() {
    this._sound = snd.sounds
    this._loaded = false
    this._needresume = false
    this._muted = false
  }

  Load(cbLoaded) {
    if(this._loaded){
      if(cbLoaded){
        cbLoaded()
      }
      return 
    }
    this._sound.load([
      _assetMusicPath + "mischen1.wav",
      _assetMusicPath + "click_4bit.wav"
    ]);
    this._sound.whenLoaded = () => {
      console.log('Sounds loaded OK')
      this._loaded = true
      this._needresume = true
      if (cbLoaded) {
        cbLoaded()
      }
    }
  }
    
  Play(name) {
    let piece
    if (store.state.pl.muted){
      return
    }
    switch (name) {
      case 'mix':
        piece = this._sound[_assetMusicPath + "mischen1.wav"]
        break;
      case 'played':
        piece = this._sound[_assetMusicPath + "click_4bit.wav"]
        break;
    }
    if (piece) {
      if (this._needresume){
        piece.resume()
        this._needresume = false
      }
      
      piece.play()
    } else {
      console.error('Sound unavailable: ', name)
    }
  }
}

let _instance
export function GetMusicManagerInstance() {
  if (!_instance) {
    _instance = new MusicManager()
  }
  return _instance
}
