describe('random manager test', function () {
    
  it('set predifined deck', () => {
      let deck_info = new cup.DeckInfo();
      let cards = deck_info.get_cards_on_game();
      let rnd_mgr = new cup.RndMgr()
      let predefStr = '_2d,_6b,_7s,_Fc,_Cd,_Rd,_Cb,_5d,_Ab,_4s,_Fb,_Cc,_7b,_As,_5s,_6d,_Fs,_Fd,_6c,_5b,_Cs,_6s,_3d,_3b,_4d,_3c,_2b,_7c,_Rs,_4c,_Rb,_2c,_4b,_2s,_Rc,_3s,_5c,_Ad,_7d,_Ac'
      let predefDeck = predefStr.split(',')
      rnd_mgr.set_predefined_deck(predefStr);
      rnd_mgr.set_predefined_player(1)
      let shuffled = rnd_mgr.get_deck(cards)
      let first = rnd_mgr.get_first_player(2)

      expect(shuffled).toEqual(predefDeck)
      expect(first).toEqual(1)

      // swap 2 elements to use a predifined array, not a string
      let tmp = predefDeck[0]
      predefDeck[0] = predefDeck[1]
      predefDeck[1] = tmp
      rnd_mgr.set_predefined_deck(predefDeck);
      shuffled = rnd_mgr.get_deck(cards)
      expect(shuffled).toEqual(predefDeck)
      //console.log('swapped ', predefDeck)
  })

  it('shuffle cards', () => {
      let deck_info = new cup.DeckInfo();
      let cards = deck_info.get_cards_on_game();
      let rnd_mgr = new cup.RndMgr()
      let shuffled = rnd_mgr.get_deck(cards)
      expect(cards).not.toEqual(shuffled)
      expect(cards.length).toEqual(shuffled.length)
      console.log('cards shuffled ', shuffled)
  })

  it('first player', () => {
      let rnd_mgr = new cup.RndMgr()
      let stat = [0,0]
      for(let i = 0; i < 1000; i++){
          let ix = rnd_mgr.get_first_player(2)
          stat[ix] ++
      }
      expect(stat[0] > 0).toBe(true,'primo elemento > 0')
      expect(stat[1] > 0).toBe(true, 'secondo elemento > 0')
      console.log('stat on ix ', stat)
  })
});