export class BriscBaseOptGfx{
  constructor(num_segni_match, deck_name ){
    this.num_segni_match = num_segni_match
    this.deck_name = deck_name
  }

  render(){
    return `<!-- Finestra Modale per le opzioni-->
    <div class="ui basic modal">
      <div class="ui icon header">
        <i class="cogs icon"></i>
        Opzioni della briscola in due
      </div>
      <div class="content">
        <p>Segni della partita</p>
        <p>Nome del giocatore</p>
        <p>Mazzo delle carte</p>
      </div>
      <div class="actions">
        <div class="ui red basic cancel inverted button">
          <i class="remove icon"></i>
          Cancella
        </div>
        <div class="ui green ok inverted button">
          <i class="checkmark icon"></i>
          Conferma
        </button>
      </div>
    </div>`
  }
}