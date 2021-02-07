## cup-service
Un service della cuperativa in golang e vuetify. Rendering del gioco delle carte in pixi.js.

## Info generali sul qualcosa che inizia e non finisce mai
Il gioco della Cuperativa è ispirato all'applicazione scritta in Ruby Cuperativa.
Il porting in Javascript/go non è stato immediato, ma pieno di insidie e trappole.
Quella che ha frenato di più lo sviluppo è stata la parte grafica. Molto demotivante
e quindi molto suscettibile alla procrastinazione. Non rimandare a domani quello che puoi fare tra un anno con una nuova libreria. 
Ritrovarmi a programmare, per esempio, dei menu con dei construtti del genere:
```html
<ul>
<ui>Gioca</ui>
</ul>
```
Oppure interfacce grafiche complesse con:
```html
<canvas>Qui la tua meraviglia!</canvas>
<div>Che cosa sarebbe il mondo senza un div?</div>
<p>Forse un mondo fatto di p h1 h2 h3 </p>
E alla fine indovina come si chiama la classe che serve da mettere nel div 
del tuo prossimo e incredibile css: grid-12-sm o grid-10-sp ?
Forse perché non l'hai scritto in uno splendido package.json? 
```

Pian piano, però, una luce di nuovi tool e metodi appaiono alla fine del tunnel, così che anche dei programmatori del piffero come me, finalmente, riescono a produrre qualcosa di apparentemente presentabile in un'applicazione web.   
Specialmente quando smettono di editare file json o scrivere delle sigle strane a fianco di infinite ripetute di _div_.


## Unit Test
Ho sviluppatoi col tempo delle unit test che eseguono il check del core.
Ho usato la unit test di Jasmine  
Usa il link http://localhost:5571/cup/test-jasmine
Dove uso il file games-cup.js per rendere il namespace cup disponibile alla test suite.
Il file SpecRunner.html deve essere fornito dal server web e non come file statico,
quindi è finito sotto i templates.
L'istruzione script type="module" in SpecRunner.html è il bridge.
I file di spec vanno messi al fianco dell'implementazione delle classi. Il file SpecRunner.html
va aggiornato manualmente.
La unit test nel deployment va disattivata in confing.toml

## Websocket
Quando mi verrà voglia di implementare un protocollo di rete, websocket sarà la scelta.
Bare.

## Gfx
Dopo diversi esperimenti, compreso quello di usare il DOM per creare la grafica del gioco,
ho abbandonato l'idea in favore della libreria pixjs. 
In tmp/reference_app.js_copy.js ho messo alcune prove per quanto riguarda la prova con la libreria.

## Vue
La grafica è realizzata con vuetify senza nessun node.js. Go fa da server Chrome il refresh.
L'applicazione vue è nel solo file js, dove però la sezione template non è editata direttamente
ma copiata dal file <componente>.vue dello stesso nome del file js. 
Per fare andare l'applicazione non bisogna editare nessun json file, settare dei transpiler,
lint vari o quant'altro simile. Bare Javascript + Vue template. 
Editare files Vue in VisualCode è molto semplice usando l'extension Vetur.
La copia nel file js la eseguo con l'extension VueTemplToJs, che può essere usata anche 
senza VisualCode.


### Integrazione con vuex
Lo store vuex è accessibile dalle classi tipo BriscolaGfx usando semplicemente
import store from '../../../vue/store/index.js'

### Attualizzare le carte
rsync -av carte.7z igor@invido.it:~/app/go/cup_service/current/static2/carte
Poi su invido.it
 7z x carte.7z

### Altre librerie
Oltre vue.js, pixi.js, vuetify e vuex, rxjs è rimasto come ricordo dei tempi passati. Solo per questi amari ricordi, avrei voglia di toglierla. Però fa quello che deve fare e funziona.
La versione di Vuetify che sto usando è la vuetify-v2.4.2.min.js.

### Comunicazione Gfx Game BriscolaGfx e dashboard
I comandi mostrati nella dashboard durante il gioco vengono abilitati dal gfx del gioco,
vale a dire BriscolaGfx.
Il comando abbandona viene abilitato durante la notifica on_all_ev_new_match.
Lo store funziona da bus attraverso la mutazione modifyGameActionState per la registrazione.
La mutazione callGameActionState viene usata per l'esecuzione.

### TODO
- Sto cercando di completare la classe BriscolaGfx.

## Service
Start del service:
sudo systemctl start cup-invido

Per vedere i logs si usa:
sudo journalctl -f -u cup-invido

Se ci sono dei problemi si può vedere con:
sudo systemctl status cup-invido.service