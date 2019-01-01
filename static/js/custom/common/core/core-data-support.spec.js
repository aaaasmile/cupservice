describe('CoreDataSupport test', function(){
  it('round table 1', () => {
      let coreData = new cup.CoreDataSupport()
      coreData.start(2, ['Luigi', 'Ernesto'], 3)
      let deck_info = new cup.DeckInfo();
      let cards = deck_info.get_cards_on_game();
      coreData.start_new_giocata(0, cards)
      expect(coreData.round_players).toEqual(['Luigi', 'Ernesto'])
  })
  it('round table 2', () => {
      let coreData = new cup.CoreDataSupport()
      coreData.start(2, ['Luigi', 'Ernesto'], 3)
      let deck_info = new cup.DeckInfo();
      let cards = deck_info.get_cards_on_game();
      coreData.start_new_giocata(1, cards)

      expect(coreData.round_players).toEqual(['Ernesto', 'Luigi'])
  })
  it('round table by name', () => {
      let coreData = new cup.CoreDataSupport()
      coreData.start(num_of_players = 2, players = ['Luigi', 'Ernesto'], hand_player_size = 3)
      let deck_info = new cup.DeckInfo();
      let cards = deck_info.get_cards_on_game();
      coreData.start_new_giocata(first_ix = 0, cards)
      coreData.round_players_by_player(player = 'Ernesto')
      expect(coreData.round_players).toEqual(['Ernesto','Luigi'])

      coreData.round_players_by_player(player = 'Luigi')
      expect(coreData.round_players).toEqual(['Luigi','Ernesto'])
  })
})
