# Fintraffic - Koululentojen varausjärjestelmä

## Project

An online calendar for reserving times for school flights at airports. Project made during the University of Helsinki course "Software Engineering Lab" for Fintraffic Lennonvarmistus

## Installation

1. Install packages

`npm install`

2. Add the following line to the .env file in project root for local development:

`DATABASE_URL=postgres://postgres:postgres@localhost:5432/postgres`

### Usage

1. Start the development database with the following command:

`npm run start:database`

2. Start client and server

`npm start`

- Client and server can be run separately

`npm run start:backend`

`npm run start:frontend`

### Build

- Client and server can be built with

`npm run build`

### Development

This project uses ESLint to maintain code quality and keep the code style consistent to the Airbnb JavaScript style guide.

You can find any errors with the following command:  
`npm run lint`

Or try to automatically fix them:  
`npm run lint -- --fix`

This project also uses Jest for automatic unit tests. You can run them with the following command:  
`npm test`
