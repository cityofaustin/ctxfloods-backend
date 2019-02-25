# CTXfloods-backend

Central Texas Floods Backend

- [Set Up Development Environment](#Set-Up-Development-Environment)
- [Run Tests](#Run-Tests)
- [Development Tips](#development-tips)
- [Disaster Recovery](#disaster-recovery)

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
Warning: Running "yarn test" will drop your local floods data and load in test data. You will need to re-run "yarn setup-local" to reload the correct seed data.

It might be necessary to install Watchman if you see errors running the `yarn test` command. See this Github Issue for more details: https://github.com/facebookincubator/create-react-app/issues/871

<img src="/README/backendtestspassed.png" align="middle" height="93" >

## Deployment Process
Branch promotion works like this:<br>
feature -> dev -> master

Create your feature branch as a branch off "dev". That feature branch will be merged into "dev", which will then be merged into "master."

CTXFloods uses TravisCI for continuous integration. Whenever you push to github, a TravisCI build will be triggered. By default this will only run the tests. If you want to deploy your feature branch on a git push, add the name of your feature branch to `deployment/devDeployConfig` with the option `deploy: true`. (Look at `travis.yml` and `deployment/shouldDeploy.js` to see exactly how this logic works.) Subsequent pushes from the same branch will update this same stack. Ex:
```
"195-camera": {
  deploy: true,
  seed: true
}
```
Specify `seed: true` if you would like the seed data to be loaded into your deployed backend.

A deployed backend CloudFormation stack consists of a Postgres database and 8 lambda function endpoints (located in the `handlers/` directory). All of this will be created automatically when TravisCI's build phase runs `serverless.yml` from `deployment/deploy.sh`.

Environment variables are sourced from `deployment/vars` depending on your branch. (All feature branches share the same environment variables as `dev.sh`. Any feature branch specific configs should be handled in `deployment/devDeployConfig.js`.) Any environment variable prefixed with `TRAVIS_` is a secret environment variable that is stored in TravisCI. It will get loaded in during the build phase of a TravisCI/github deployment.

It would be possible to deploy ctxfloods without continuous integration by running `deployment/deploy.sh`. However, you would have to provide your own substitutes for the `TRAVIS_` environment variables.

## Development Tips
+ If you added a new postgres migration file to the backend, regenerate the frontend's graphql schema file by running `yarn get-schema`
+ Environment variables prefixed by `TRAVIS_` are secret variables stored in TravisCI. They get loaded in during the build phase of a TravisCI/github deployment.

## Disaster Recovery
+ The postgres database can be restored by reverting to a point-in-time snapshot backup.
+ You can also rebuild an entire CloudFormation Stack using a snapshot backup. This requires a couple changes to your serverless.yml file.
   1. Add `DBSnapshotIdentifier: '[rds snapshot identifier]'` to the pgDB Properties section of serverless.yml.
      + Note - If the DBSnapshotIdentifier property is ever removed (or changed) for the same AWS Service, this would trigger a database delete. The `DeletionProtection` Property would prevent that deletion, but it would also prevent your stack from updating. More information can be found here: https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-rds-database-instance.html
  2. Remove the `DBName` Property. This Property is incompatible with `DBSnapshotIdentifier`.
