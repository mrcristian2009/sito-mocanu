# Sito Mocanu

Portfolio di Robert-Cristian Mocanu. Sito statico: HTML, CSS e JavaScript, senza build né dipendenze (solo i font da Google Fonts).

## Struttura

```
index.html        pagina unica con tutte le sezioni
css/style.css     stile e animazioni
js/main.js        menu, finestra CMD, elenco progetti, barre di confronto, modulo
favicon.svg
```

## Da completare

- **Modulo di contatto**: in `js/main.js` imposta `CONFIG.formEndpoint` con l'URL del servizio che riceve i messaggi (per esempio Formspree o Web3Forms). Finché è vuoto, il modulo mostra "Il modulo non è ancora attivo".
- **CV**: il pulsante punta al PDF già online su mrcristian.vercel.app. Quando vuoi renderlo indipendente, aggiungi il file nella radice del progetto e cambia il link in `index.html`.

## Anteprima in locale

```
python -m http.server 8000
```

Poi apri http://localhost:8000.

## Pubblicazione

Su Vercel basta importare il repository: non serve nessuna configurazione di build.
