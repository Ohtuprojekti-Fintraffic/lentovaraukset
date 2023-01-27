# Fintraffic - Koululentojen varausjärjestelmä
## Installation
1. Install packages

`npm install`

### Usage

2. Start client and server

`npm start`

3. Build client and server

`npm run build`

4. Start client and server separately

`npm run start:backend`

`npm run start:frontend`

### Development

This project uses ESLint to maintain code quality and keep the code style consistent to the Airbnb JavaScript style guide.

You can find any errors with the following command:  
`npm run lint`

Or try to automatically fix them:  
`npm run lint -- --fix`

This project also uses Jest for automatic unit tests. You can run them with the following command:  
`npm test`

### Database

Start the development database with the following command (sudo required):

`docker compose -f docker-compose.dev.yml up`

Add the following line to the backend's .env file:

`DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres`
