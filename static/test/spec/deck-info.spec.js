
describe('deck test', () => {
  it('Rank call', () => {
    let deck = new cup.DeckInfo();
    expect(deck.get_rank('_Ab')).toBe(0);
  });

  it('Name call', () => {
    let deck = new cup.DeckInfo();
    expect(deck.get_card_info('_7c').nome).toBe('sette coppe');
  });

  it('Deck briscola rank', () => {
    let deck = new cup.DeckInfo();
    deck.deck_info_dabriscola();
    expect(deck.get_rank('_6s')).toBe(6);
    expect(deck.get_points('_3s')).toBe(10);
  });
});