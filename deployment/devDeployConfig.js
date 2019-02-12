/**
  Config file to determine how dev branches should be deployed.
  If dev branch is not listed here, then it will not be deployed.
  master branch will always deploy, it does not use this config.

  [branch-name]: {
      deploy: Boolean (indicate whether to deploy or not),
        Defaults to false.
      seed: Boolean (indicate whether to seed data into new deployment or not)
        Defaults to false.
      pushNotifications: Boolean, toggle sending emails to community admins when crossings need updating
        Defaults to false
      customServiceName: String, a custom AWS Service Name.
        Defaults to branchName.
        This can be used to push changes to an existing deployment that doesn't share the branch name.
        Can push to an environment like "sandbox-1" to save deployment time.
        If "customServiceName" is not an existing deployment, then no time will be saved because a new CloudFormation must still be created.
  }
**/

module.exports = {
  "dev": {
    deploy: true,
    seed: true
  },
  "444-postgraphile": {
    deploy: true,
    seed: true,
  },
  "386-pw-reset": {
    deploy: true,
    seed: true
  }
};
