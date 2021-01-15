import * as snd from './sound.js'


const _assetMusicPath = "static/assets/sound/"
export class MusicManager {
  constructor() {
    this._sound = snd.sounds
  }
  Load(cbLoaded) {
    this._sound.load([
      _assetMusicPath + "mischen1.wav",
      _assetMusicPath + "click_4bit.wav"
    ]);
    this._sound.whenLoaded = () => {
      console.log('Sounds loaded OK')
      cbLoaded()
    }
  }
  Play(name) {
    let piece
    switch (name) {
      case 'mix':
        piece = this._sound[_assetMusicPath + "mischen1.wav"]
        break;
      case 'played':
        piece = this._sound[_assetMusicPath + "click_4bit.wav"]
        break;
    }
    if (piece) {
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
