describe('core state event base test', function () {
    it('Simple game loop', () => {
        let coreStateManager = new cup.CoreStateManager('develop');
        let tableStateCore = new cup.TableStateCore(coreStateManager, 2);
        let playerActorErnesto = new cup.PlayerActor(new cup.Player('Ernesto'), coreStateManager);
        let playerActorLuigi = new cup.PlayerActor(new cup.Player('Luigi'), coreStateManager);

        playerActorErnesto.sit_down(0);
        playerActorLuigi.sit_down(1);

        coreStateManager.process_all();
        expect(1).toBe(1);
    });
});

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

describe('random manager test', function () {
    // let myCustomEquality = function(a,b){
    //     return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
    // }
    // beforeEach(function () {
    //     jasmine.addCustomEqualityTester(myCustomEquality);
    // });
    

    it('shuffle cards', () => {
        let deck_info = new cup.DeckInfo();
        let cards = deck_info.get_cards_on_game();
        let rnd = new cup.RndMgr()
        let shuffled = rnd.get_deck(cards)
        //jasmine.addCustomEqualityTester(myCustomEquality);
        expect(cards).not.toEqual(shuffled)
        expect(cards.length).toEqual(shuffled.length)
        console.log('cards shuffled ', shuffled)
    })

    it('first player', () => {
        let rnd = new cup.RndMgr()
        let stat = [0,0]
        for(let i = 0; i < 1000; i++){
            let ix = rnd.get_first_player(2)
            stat[ix] ++
        }
        expect(stat[0] > 0).toBe(true,'primo elemento > 0')
        expect(stat[1] > 0).toBe(true, 'secondo elemento > 0')
        console.log('stat on ix ', stat)
    })
});