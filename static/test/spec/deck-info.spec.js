
describe('deck test', () => {
  let deck = new cup.DeckInfo();
  it('Rank call', () => {
    expect(deck.get_rank('_Ab')).toBe(0);
  });

  it('Name call', () => {
    expect(deck.get_card_info('_7c').nome).toBe('sette coppe');
  });

  it('Deck briscola rank', () => {
    deck.deck_info_dabriscola();
    expect(deck.get_rank('_6s')).toBe(6);
    expect(deck.get_points('_3s')).toBe(10);
  });
});