/**
  Config file to determine how dev branches should be deployed.
  If dev branch is not listed here, then it will not be deployed.
  master branch will always deploy, it does not use this config.

  [branch-name]: {
      deploy: Boolean (indicate whether to deploy or not),
      seed: Boolean (indicate whether to seed data into new deployment or not)
      pushNotifications: Boolean, toggle sending emails to community admins when crossings need updating
  }
**/

module.exports = {
  "dev": {
    deploy: true,
    seed: true
  },
  "402-community": {
    deploy: true,
    seed: true,
    pushNotifications: true
  }
};
