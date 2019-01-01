//////////////////////////////////////////
//////////////////////////////// RndMgr
//////////////////////////////////////////
export class RndMgr {
  constructor() {
    this._predefCards = []
    this._predefPlayerIx = -1
  }

  set_predefined_deck(card_obj) {
    if (card_obj && typeof (card_obj) === 'string') {
      let deck_to_use = card_obj.split(",");
      this._predefCards = deck_to_use
    } else if (card_obj && Array.isArray(card_obj)) {
      this._predefCards = card_obj
    }
  }

  set_predefined_player(ix) {
    this._predefPlayerIx = ix
  }

  get_deck(cards) {
    if (this._predefCards.length > 0) {
      console.log('CAUTION: using a presetted deck')
      return [...this._predefCards]
    }
    return this.shuffle(cards)
  }

  get_first_player(size) {
    if (this._predefPlayerIx !== -1) {
      console.log('CAUTION: using a presetted first player')
      return this._predefPlayerIx
    }
    let i = Math.floor(Math.random() * size);
    return i
  }

  shuffle(source) {
    //Knuth-Fisher-Yates shuffle algorithm.
    let array = [...source]
    let m = array.length, t, i;
    // While there remain elements to shuffle…
    while (m) {
      // Pick a remaining element…
      i = Math.floor(Math.random() * m--);
      // And swap it with the current element.
      t = array[m];
      array[m] = array[i];
      array[i] = t;
    }

    return array;
  }
}
