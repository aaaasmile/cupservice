## cup-service
Un service della cuperativa in golang (web socket e rest) ed ui in javascript

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

## TODO
- continua con la classe BriscAlgGfx: segnapunti, mazzo, distribuzione, ...

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
Dopo essere partito da Angular poi passato a React e infine a Vue, ho deciso di usare 
il file index.html puro con la libreria grafica mdl do google. 
Si può rispolverare vue in futuro quando servirà una ui per gestire tutto quello 
fuori dai giochi (vedi dir ..\old\cup-service-vue-react) senza troppi polpettoni vari.
React senza webpack (monofile) diventa troppo difficile da gestire. I polpettoni alla webpack ancora meno.
Angular invece è da evitare. Sempre che non si voglia passare il tempo ad aggiornare la libreria 
(versione a oggi è 8 mentre ero partito dalla 2 e ad ogni salto puoi partire da capo), 
editare file json invece di programmare, capire
perché un modulo non viene caricato, come integrare una libreria esterna in type script e alla fine
avere non funzionante quello che fino a ieri aveva funzionato prima di un'update generica.



