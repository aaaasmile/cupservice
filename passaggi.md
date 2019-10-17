## cup-service
Un service della cuperativa in golang (web socket e rest)
Client basic in react (e ora Vue) single file.

## Info module
Il gioco della cuperativa l'ho sviluppato usando ES6 con i moduli direttamente in browser.
Non uso nessun webpack, ma è il browser chrome ad assemblare i moduli.
In React dovrebbe essere possibile importare le varie classi usando import (js/custom/**/*).
In index.html non si dovrebbe caricare nulla di games-cup.js.
Nella unit test di Jasmine invece si (vedi /js/custom/test/SpecRunner.html)
dove uso il file games-cup.js per rendere il namespace cup disponibile alla test suite.
L'istruzione script type="module" in SpecRunner.html è il bridge.
I file di spec vanno messi al fianco dell'implementazione delle classi. Il fileSpecRunner.html
va aggiornato manualmente.
I files jsconfig.json mi servono per avere il code complete in VS code.

## TODO
- Continua con la classe BriscBaseGfx (manca il mazzo e la briscola)
- Nel core manaca la registrazione del game come in cuperativajs (_game_core_recorder)
- Il core della briscola va agganciato alla ui
- La partita della briscola nel core non è completa. Dopo st_mano_end non è finito. Qui
manca il st_game_end dopo aver finito la giocata. [DONE]
- C'è da finire il file games-cup.js il quale va completato usando il games-cup-todo.js [DONE]
- Poi andrebbe testato con una unit test, magari nella directory parallela dove uso node. [DONE Jasmine]
- usa {{.RootUrl}} nel template difianco alla parola static per avere url assolute e non relative al path. 
Con / funziona senza, ma appena aggiungi un sub path, arrivano problemi tipo scripts non caricati.

## Problemi
Ho avuto problemi con i files statici. Specialmente quelli che vanno in module (games-cup.js). 
In questo caso Jasmine (specrunner.html) non va.
Essi devono  essere del tipo application/javascript e non text/plain. Su windows questo mime viene preso 
da HKEY_CLASSES_ROOT\.js\

## Versione v0.1.20190113-00
In questa versione ho provato a creare la ui usando il canvas. Non sono arrivato ad un risultato 
soddisfacente e quindi l'esperimento con il canvas e createjs finisce qui. 

## Tag
git tag -a v0.1.20190113-00 -m "canvas try"
git push origin tag v0.1.20190113-00

## Vue
Ho cominciato a riscrivere la UI usando Vue.js invece di React. In questo modo
sembra più facile gestire anche i componenti di una partita. In React arrivo fino al 
momento dell'inizio e poi ho tentato di creare i componenti della partita manipolando il dom
nel codice. Questo complica di molto l'app con risultati grafici modesti.
Per far gestire tutta l'applicazione da react, occorre avere dei moduli separti e componenti 
all'interno di app.jsx. Ma per avere una separazione degli jsx, serve un build-chain, che
proprio non voglio settare. Go, Chrome e Visual Code sono sufficienti.
Con Vue e i template multilines nel codice, è possibile 
avere una separazione in componenti in files separati senza usare una build-chain, ma solo 
il caricamento dei moduli che avviene in Chrome usando index.html.

## Websocket
Ho iniziato nel file cup-ws-handler and implementare il protocollo cuperativa con websocket.
Si può testare con il robot in ruby nella directory: PS D:\scratch\sinatra\cup_sinatra_local\middlewares\robots>
Dove basta lanciare ruby .\cuperativa_bot.rb
Quello che manca è la lettura della richiesta del client.