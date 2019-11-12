
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

  get_info(){
    return (JSON.stringify(this))
  }

  is_waiting_for_start(){
    return this.match_state === ''
  }

  is_ongoing(){
    return this.match_state === 'Started'
  }

  is_terminated(){
    return this.match_state === 'end'
  }
}