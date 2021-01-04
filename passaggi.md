## cup-service
Un service della cuperativa in golang e vuetify. Rendering del gioco delle carte in pixi.js.

## Info module
Il gioco della cuperativa l'ho sviluppato usando ES6 con i moduli direttamente in browser.
Non uso nessun webpack, ma è il browser chrome ad assemblare i moduli.
In index.html non si dovrebbe caricare nulla di games-cup.js.
Nella unit test di Jasmine invece si (vedi http://localhost:5571/cup/static/js/test/SpecRunner.html)
dove uso il file games-cup.js per rendere il namespace cup disponibile alla test suite.
L'istruzione script type="module" in SpecRunner.html è il bridge.
I file di spec vanno messi al fianco dell'implementazione delle classi. Il fileSpecRunner.html
va aggiornato manualmente.
I files jsconfig.json mi servono per avere il code complete in VS code.
## Problemi
Ho avuto problemi con i files statici. Specialmente quelli che vanno in module (games-cup.js). 
In questo caso Jasmine (specrunner.html) non va.
Essi devono  essere del tipo application/javascript e non text/plain. Su windows questo mime viene preso 
da HKEY_CLASSES_ROOT\.js\


## Tag
git tag -a v0.1.20190113-00 -m "canvas try"
git push origin tag v0.1.20190113-00

## Websocket
Ho iniziato nel file cup-ws-handler and implementare il protocollo cuperativa con websocket.
Si può testare con il robot in ruby nella directory: PS D:\scratch\sinatra\cup_sinatra_local\middlewares\robots>
Dove basta lanciare ruby .\cuperativa_bot.rb
Quello che manca è la lettura della richiesta del client.

## Gfx
Dopo diversi esperimenti, compreso quello di usare il DOM per creare la grafica del gioco,
ho abbandonato l'idea in favore della libreria pixjs. 
In tmp/reference_app.js_copy.js ho messo alcune prove per quanto riguarda la prova con la libreria.

## Angular, React, Vue e pure html
Dopo essere partito da Angular (mamma mia che polpettone) poi passato a React, a Vue, ho deciso di usare 
il file index.html puro con la libreria grafica mdl do google. Ma non sono andato molto lontano.
Con vuetify, invece, sembra andare molto meglio.

Ora è arrivato il momento di rispolverare vue con vuetify per gestire il flusso del gioco (vedi dir ..\old\cup-service-vue-react).

React senza webpack (monofile) diventa troppo difficile da gestire. I polpettoni alla webpack ancora meno.
Angular invece è da evitare. Sempre che non si voglia passare il tempo ad aggiornare la libreria 
(versione a oggi è 8 mentre ero partito dalla 2 e ad ogni salto puoi partire da capo), 
editare file json invece di programmare, capire
perché un modulo non viene caricato, come integrare una libreria esterna in type script e alla fine
avere non funzionante quello che fino a ieri aveva funzionato prima di un'update generica.

### Integrazione con vuex
Lo store vuex è accessibile dalle classi tipo BriscolaGfx usando semplicemente
import store from '../../../vue/store/index.js'

### Attualizzare le carte
rsync -av carte.7z igor@invido.it:~/app/go/cup_service/current/static2/carte
Poi su invido.it
 7z x carte.7z

## Tink.js
Una libreria datata che mi sono ritrovato e che credevo che servisse per l'handling dei click
sugli sprites e il drag&drop.
Purtroppo non mi ha funzionato il click in quanto c'è un offset del canvas che influenza
l'handling. Un problema riportato su github https://github.com/kittykatattack/tink/issues/12
Risolto togliendo la dipendenza di tink e usato la modalità interactive dello sprite.

## TODO
- Sto cercando di completare la classe BriscolaGfx. Sono arrivato a mano end