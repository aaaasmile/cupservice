import { DeckInfo } from '../../../shared/deck-info.js'

function removeItemOnce(arr, value) {
    if (!value) {
        return arr
    }
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
    }else{
        throw(new Error(`Don not expect to remove an item that is not found ${value}`))
    }
    return arr;
}

function removeItems(arr, arrval) {
    arrval.forEach(element => {
        arr = removeItemOnce(arr, element)
    });
    return arr
}

const AlgPosition = (cards_on_hand, cards_on_opp, top_deck, briscola, card_taken, card_opp_taken, points_me, points_opp, card_mano_played, card_playing, is_max) => {
    let _score = 0
    let _children = []
    const _cards_on_hand = cards_on_hand.slice()
    let _cards_on_opp = cards_on_opp.slice()
    const _top_deck = top_deck
    const _briscola = briscola
    const _card_taken = card_taken.slice()
    const _card_opp_taken = card_opp_taken.slice()
    const _card_mano_played = card_mano_played.slice()
    const _points_me = points_me
    const _points_opp = points_opp
    const _card_playing = card_playing
    const _is_maximizingplayer = is_max
    if(_card_playing){
        _cards_on_opp = removeItemOnce(_cards_on_opp, _card_playing)
    }
    
    
    const _deck = new DeckInfo
    let _deck_remain = _deck.get_cards_on_game()
    _deck_remain = removeItemOnce(_deck_remain, _top_deck)
    _deck_remain = removeItemOnce(_deck_remain, _briscola)
    _deck_remain = removeItems(_deck_remain, _cards_on_hand)
    _deck_remain = removeItems(_deck_remain, _cards_on_opp)
    _deck_remain = removeItems(_deck_remain, _card_taken)
    _deck_remain = removeItems(_deck_remain, _card_mano_played)
    _deck_remain = removeItems(_deck_remain, _card_opp_taken)
    //console.log('*** deck remain ', _deck_remain,  _deck_remain.length)

    return {
        build_position(best_choice_card) {
            console.log('Build position starting with ', best_choice_card)
            const cards_to_play = []
            if (best_choice_card) {
                cards_to_play.push(best_choice_card)
            }
            _cards_on_hand.forEach(card_lbl => {
                if (card_lbl !== best_choice_card) {
                    cards_to_play.push(card_lbl)
                }
            });

            cards_to_play.forEach(card_lbl => {
                if (this.is_swap_player(card_lbl)) {
                    console.log('*** swap player ')
                    const child = AlgPosition(
                        _cards_on_opp,
                        _cards_on_hand,
                        _top_deck,
                        _briscola,
                        _card_opp_taken,
                        _card_taken,
                        _points_opp,
                        _points_me,
                        _card_mano_played,
                        card_lbl,
                        !_is_maximizingplayer
                    )
                    _children.push(child)
                } else {
                    console.log('*** no player swap: new mano same player')
                    throw (new Error(`TODO position on the same player`))
                }

            });

        },
        is_swap_player(card_lbl) {
            if (_card_mano_played.length === 0) {
                return true
            }
            return false
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
            console.warn('Stati evaluate position')
            throw (new Error(`TODO evaluate position`))
        },
        get_num_children() {
            return _children.length
        },
        get_child(index) {
            return _children[index]
        },
        is_maximizingplayer() {
            return _is_maximizingplayer
        }
    }
}

export default AlgPosition;