# Multiplayer-Backend

This is the server used for the multiplayer in the [overworld](https://github.com/Gamify-IT/overworld).
It consists of a REST API and WebSocket support for real-time communication. \
For more information, please refer to the [docs](https://gamifyit-docs.readthedocs.io/en/latest/dev-manuals/architecture/multiplayer/README.html).

## Development 
### Getting Started
Install [Unity Version 2021.3.2f1 (LTS)](https://unity.com/de/releases/editor/whats-new/2021.3.2).
#### Overworld
Clone the repository  
```sh
git clone https://github.com/Gamify-IT/overworld.git
```
#### Multiplayer Server
Clone the repository  
```sh
git clone https://github.com/Gamify-IT/multiplayer-backend.git
```
Install the dependencies
```sh
npm install
```
### Build and Run
Build the unity project like described in [this manual](https://gamifyit-docs.readthedocs.io/en/latest/dev-manuals/languages/docker/docker-compose-unity.html).

To run the multiplayer server locally with IDE features and all necessary dependencies, start the dependencies via docker:
```sh
docker compose -f docker-compose-dev.yaml up
```
Then start the frontend with:
```sh
npm run dev
```
You can now access the game at [localhost](http://localhost).

## Tests
There are a few [tests](https://github.com/Gamify-IT/multiplayer-backend/blob/main/tests/) to check system performance and feature accuracy. \
Tests can be run with:
```sh
npm run test
```
### Unique ID generation 
The generation of new client session ids is [tested](https://github.com/Gamify-IT/multiplayer-backend/blob/main/tests/idGeneration.spec.ts) for:
- uniqueness
- reuse after release
- error for releasing invalid id
- error for unavailable ids
