module.exports = () => {
  global.__TEST_SERVER__.close(() => {
    console.log("Test Server closing");
  });
}
