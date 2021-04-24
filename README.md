# API-note

## Short description project
This is an HTTP API for managing personal notes.

## Link heroku
https://api-note-3moc.herokuapp.com/

## Route API

#### Signup
##### POST /signup
###### Informations 
- username (Between 2 and 20 character, In lowercase)
- password (Minimum 4 character)

#### Signin
##### POST /signin
###### Informations
- username
- password

#### Get notes
##### GET /notes
###### Informations
- x-access-token (This is the code it sends back to you when you want to log in)

#### Add note
##### PUT /notes
###### Informations
- x-access-token (This is the code it sends back to you when you want to log in)
- content 

#### Modify note
##### PATCH /notes/:id
###### Informations
- id (This is the id of the note)
- content (This is the new content)

#### Delete note
##### DELETE /notes/id
###### Informations
- id (This is the id of the note)

## Clone project
git clone git@github.com:nguyen.1909/API-note.git

## Start project
``` cd API-note ```

## Install the dependencies 
``` npm install ```

## Run project

#### To run the project in production mode
- ``` npm start ```

#### To run the project in development mode
- ```npm run dev ```

## Contributor
- NGUYEN David
- VALLEE Gwendal 
- BROUILLE Théo 
- GAMIZ Théo