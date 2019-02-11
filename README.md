# CTXfloods-backend

Central Texas Floods Backend

- [Set Up Development Environment](#Set-Up-Development-Environment)
- [Run Tests](#Run-Tests)
- [Development Tips](#development-tips)


## Set Up Development Environment

💾 Install [Postgres](https://www.postgresql.org/) v10.6 🐘

* If you're using macOS I strongly recommend using [Postgres.app](http://postgresapp.com/)

💾 [Install yarn](https://yarnpkg.com/en/docs/install)

👯 Clone the repo

```
git clone https://github.com/cityofaustin/ctxfloods-backend
cd ctxfloods-backend
yarn install
```

🐘 Make sure postgres is running

* Make sure [psql](https://postgresapp.com/documentation/cli-tools.html) works in your terminal

🌱 Seed Data

```
yarn setup-local
```

⌨️ Start the local server

```
yarn start-local
```

💾 Clone and install [CTXfloods-frontend](https://github.com/cityofaustin/ctxfloods)

🍻 Cheers! The backend should now be up and running!

## Run Tests

```
yarn test
```
_Warning: Running "yarn test" will drop your local floods data and load in test data. You will need to re-run "yarn setup-local" to reload the correct seed data._

_It might be necessary to install Watchman if you see errors running the `yarn test` command. See this Github Issue for more details:_ https://github.com/facebookincubator/create-react-app/issues/871

<img src="/README/backendtestspassed.png" align="middle" height="93" >

## Deployment Process
Branch promotion works like this:<br>
feature -> dev -> master

Create your feature branch as a branch off "dev". That feature branch will be merged into "dev", which will then be merged into "master."

CTXFloods uses TravisCI for continuous integration. Whenever you push to github, a TravisCI build will be triggered. By default this will only run the tests. If you want to deploy your feature branch on a git push, add the name of your feature branch to `deployment/devDeployConfig` with the option `deploy: true`. This will build a new CloudFormation stack for your feature branch backend (database, lambda functions are built automatically). Subsequent pushes from the same branch will update this same stack. Ex:
```
"195-camera": {
  deploy: true,
  seed: true
}
```
Specify `seed: true` if you would like the seed data to be loaded into your deployed backend.

## Development Tips
+ If you added a new postgres migration file to the backend, regenerate the frontend's graphql schema file by running `yarn get-schema`
