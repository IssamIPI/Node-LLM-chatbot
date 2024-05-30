# Node-LLM-chatbot
## First Install all the dependencies
- `npm install `

## Add env variable for GOOGLE credential Before Running the server:
### Windows OS :
- `$env:GOOGLE_APPLICATION_CREDENTIALS="Path-TO-APP\Node-LLM-chatbot\src\services\jwt.keys.json"`

### MacOS :
- `export GOOGLE_APPLICATION_CREDENTIALS="Path-TO-APP\Node-LLM-chatbot\src\services\jwt.keys.json"`

## To run the server

- `npm run main`



Les fonctionnalités :
- Redaction d'un bloc de code lisible et formaté pour faciliter la lecture du code.
- Prendre en contexte les 4 dernières questions pour répondre à la suivante.
- Resumer un fichier texte (pdf , docx , txt).
- Repondre au question d'utilisateur à l'aide d'un fichier texte (pdf , docx , txt).
- Lire et Resumer un video youtube.
- Synthèse vocal à l'aide de [ElevenLabs](https://elevenlabs.io/)
