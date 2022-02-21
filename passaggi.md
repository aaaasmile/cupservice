## cup-service
Un service della cuperativa in golang e vuetify. Rendering del gioco delle carte in pixi.js.

## Unit Test
Ho sviluppato col tempo delle unit test che eseguono il check del core.
Ho usato la unit test di Jasmine  
Usa il link http://localhost:5571/cup/test-jasmine
Dove uso il file games-cup.js per rendere il namespace cup disponibile alla test suite.
Il file SpecRunner.html deve essere fornito dal server web e non come file statico,
quindi è finito sotto i templates.
L'istruzione script type="module" in SpecRunner.html è il bridge.
I file di spec vanno messi al fianco dell'implementazione delle classi. 
Il file SpecRunner.html va aggiornato manualmente.
La unit test nel deployment va disattivata in confing.toml

## Websocket
Quando mi verrà voglia di implementare un protocollo di rete, websocket sarà la scelta.
Bare.

## Gfx
Dopo diversi esperimenti, compreso quello di usare il DOM per creare la grafica del gioco,
ho abbandonato l'idea in favore della libreria pixjs. 
In tmp/reference_app.js_copy.js ho messo alcune prove per quanto riguarda la prova con la libreria.

## Vue
La grafica è realizzata con vuetify senza nessun node.js. Go fa da server, Chrome esegue il refresh.
L'applicazione vue è nel solo file js, dove però la sezione _template_ non è editata direttamente,
ma copiata dal file _<componente>.vue_. Per ogni componente che usa Vue esistono due files:
  _<componente>.js_  
  _<componente>.vue_   
con il file .vue usato solo nell'editor di vscode.

Per fare andare l'applicazione non bisogna editare nessun json file, settare dei transpiler,
lint vari o quant'altro simile. Bare Javascript + Vue template. 
Editare files Vue in VisualCode è molto semplice usando l'extension Vetur.
Il passaggio nel file js viene eseguita con l'extension VueTemplToJs, che può essere usata anche 
senza VisualCode.


### Integrazione con vuex
Lo store vuex è accessibile dalle classi tipo BriscolaGfx usando semplicemente
import store from '../../../vue/store/index.js'

### Attualizzare le carte
rsync -av carte.7z igor@invido.it:~/app/go/cup_service/current/static2/carte
Poi su invido.it
 7z x carte.7z

### Altre librerie
Le librerie che uso sono: vue.js, pixi.js, vuetify e vuex.
La versione di Vuetify che sto usando è la vuetify-v2.4.2.min.js, 
mentre vue è la v2.6.10. Pixi è invece la  v5.3.5.

### Comunicazione Gfx Game BriscolaGfx e dashboard
I comandi mostrati nella dashboard durante il gioco vengono abilitati dal gfx del gioco,
vale a dire BriscolaGfx.
Il comando abbandona viene abilitato durante la notifica on_all_ev_new_match.
Lo store funziona da bus attraverso la mutazione modifyGameActionState per la registrazione.
La mutazione callGameActionState viene usata per l'esecuzione.


## Cosiderazioni su altre possibilità rispetto vuetify&pixi
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


## Briscola scoperta
TODO:
Uso un algoritmo minimax ma non funziona un granché bene. Bisogna seguire bene
quello che calcola e scarta.

### TODO
- set_game_state dal br-scoperta.alg.spec.js
- minmax nella soperta
- Mariazza
- Un problema molto fastidioso sulle update. Il file /static/js/vue/main.js è collegato al buildnr
che viene incrementato. Solo che tutti gli altri files che sono dipendenti (per esempio card-loader-gfx.js)
non vengono aggiornati in Chrome. L'unica soluzione trovata fino ad ora è andare CTRL +H e cancellare i dati 
della storia (immagini e dati).

## Service
Start del service:
sudo systemctl start cup-invido

Per vedere i logs si usa:
sudo journalctl -f -u cup-invido

Se ci sono dei problemi si può vedere con:
sudo systemctl status cup-invido.service

## Mobile
Sul mio iphone ho questa risoluzione di schermo:
320x568
Come si fa a vederla?
In Chrome si mette chrome://inspect in un nuovo tab. Poi si torna alla app della cuperativa
e si fa un reload. Ora si torna nel chrome://inspect tab e si vede le info dello schermo. 
Url che uso: http://192.168.2.254:5571/cup

## Deployment
Sul target si esegue (~/build/cup-service):

    git pull --all
    ./publish-cup.sh
  
# Problemi con la cache
Tutti i moduli js unbundled vengono messi nella cache. Se si modifica un modulo che non è main.js, esso non viene aggiornato alla prossima volta che viene scaricata la app.
Questo problema è descritto su:
  https://marian-caikovski.medium.com/javascript-modules-and-browser-cache-4050b72ec51c
  mentre è il codice si trova su
  https://github.com/marianc000/cachedModules/blob/master/server.js
  Per mettere le stesse linee in golang senza avere il bundle si può provare con:
  w.Header().Set("Cache-Control", "stale-while-revalidate=3600")
  nella funzione handleCupApp()
