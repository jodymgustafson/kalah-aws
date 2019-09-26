# Kalah API in AWS Lambda
API for Kalah written in AWS lambda to allow two people to play over the internet.

## API Resource
See kalah.yaml for OpenAPI specs.

- POST: /match/new/{count}
    - Creates a new match and returns a matchId
- PUT: /match/{matchId}/reset
    - Resets the game state
- PUT: /match/{matchId}/quit
    - Quits a match and cleans up resources
- PUT: /match/{matchId}/play/{bin}
    - Plays a bin for the current player
- GET: /match/{matchId}/state:
    - Gets the current state of the game