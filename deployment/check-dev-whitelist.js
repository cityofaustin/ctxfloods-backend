let branch;
const whitelist = [
  "dev-travis-hack"
];

if (process.env.TRAVIS_PULL_REQUEST === "false") {
  branch = process.env.TRAVIS_BRANCH;
} else {
  branch = process.env.TRAVIS_PULL_REQUEST_BRANCH;
}

if whitelist.includes(branch) {
  console.log("true");
} else {
  console.log("false");
}
