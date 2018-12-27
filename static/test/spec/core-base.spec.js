describe('core state event base test', function () {
    it('Simple game loop', () => {
        let coreStateEvent = new cup.CoreStateEventBase('develop');
        let tableStateCore = new cup.TableStateCore(coreStateEvent, 2);
        let playerActorErnesto = new cup.PlayerActor(new cup.Player('Ernesto'), coreStateEvent);
        let playerActorLuigi = new cup.PlayerActor(new cup.Player('Luigi'), coreStateEvent);

        playerActorErnesto.sit_down(0);
        playerActorLuigi.sit_down(1);

        coreStateEvent.process_all();
        expect(1).toBe(1);
    });
});

describe('random manager test', function () {
    let myCustomEquality = function(a,b){
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
    }
    // beforeEach(function () {
    //     jasmine.addCustomEqualityTester(myCustomEquality);
    // });

    it('shuffle cards', () => {
        let deck_info = new cup.DeckInfo();
        let cards = deck_info.get_cards_on_game().slice();
        let rnd = new cup.RndMgr()
        let shuffled = rnd.get_deck(cards)
        //jasmine.addCustomEqualityTester(myCustomEquality);
        expect(cards).not.toEqual(shuffled)
        expect(cards.length).toEqual(shuffled.length)
        console.log('cards shuffled ', shuffled)
    })
});