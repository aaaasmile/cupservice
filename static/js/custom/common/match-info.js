
//////////////////////////////////////////
//////////////////////////////// MatchInfo
//////////////////////////////////////////
export class MatchInfo {
  constructor() {
    this.match_state = '';
    this.final_score = [];
    this.end_reason = '';
    this.winner_name = '';
  }

  start() {
    this.match_state = 'Started';
    this.final_score = [];
    this.end_reason = '';
    this.winner_name = '';
  }

  end(winner, reason){
    this.end_reason = reason;
    this.winner_name = winner;
    this.match_state = 'end';
  }
}