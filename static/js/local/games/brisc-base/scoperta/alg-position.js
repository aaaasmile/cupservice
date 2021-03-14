import { DeckInfo } from '../../../shared/deck-info.js'

function removeItemOnce(arr, value) {
    if (!value) {
        return arr
    }
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }
    return arr;
}

function removeItems(arr, arrval) {
    arrval.forEach(element => {
        arr = removeItemOnce(arr, element)
    });
    return arr
}

const AlgPosition = (cards_on_hand, cards_on_opp, top_deck, briscola, card_taken, card_opp_taken, points_me, points_opp) => {
    let _score = 0
    let _children = []
    const _cards_on_hand = cards_on_hand.slice()
    const _cards_on_opp = cards_on_opp.slice()
    const _top_deck = top_deck
    const _briscola = briscola
    const _card_taken = card_taken.slice()
    const _card_opp_taken = card_opp_taken.slice()
    const _points_me = points_me
    const _points_opp = points_opp
    const _deck = new DeckInfo
    let _deck_remain = _deck.get_cards_on_game()
    _deck_remain = removeItemOnce(_deck_remain, _top_deck)
    _deck_remain = removeItemOnce(_deck_remain, _briscola)
    _deck_remain = removeItems(_deck_remain, _cards_on_hand)
    _deck_remain = removeItems(_deck_remain, _cards_on_opp)
    _deck_remain = removeItems(_deck_remain, _card_taken)
    _deck_remain = removeItems(_deck_remain, _card_opp_taken)
    //console.log('*** deck remain ', _deck_remain,  _deck_remain.length)

    return {
        build_position(best_choice_card) {
            console.log('Build position starting with ', best_choice_card)
            _cards_on_hand.forEach(card_lbl => {

            });
        },
        get_card_on_score(score) {
            for (let index = 0; index < _children.length; index++) {
                const child = _children[index];
                if (child.score === score) {
                    return this._cards_on_hand[index]
                }
            }
            throw (new Error(`Something is worng with minmax algorithm`))
        },
        is_last_card_toplay() {
            return _cards_on_hand.length === 1;
        },
        static_evalposition() {
            console.warn('Stati evaluate position : TODO')
        },
        get_num_children() {
            return _children.length
        },
        get_child(index) {
            return _children[index]
        }
    }
}

export default AlgPosition;