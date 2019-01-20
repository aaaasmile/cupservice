export class Helper {
  static MinOnWeightItem1(w_cards) {
    // expects something like this:
    // let w_cards = [
    //   ['ab', 2],
    //   ['fs', 1],
    //   ['rs', 4],
    //   ['rc', 12]
    // ];
    // and returns ['fs', 1]
    let min_ele = Math.min.apply(Math, w_cards.map(function (o) {
      return o[1];
    }));
    let min_obj = w_cards.filter(function (o) { return o[1] === min_ele; })[0];
    return min_obj;
  }
}