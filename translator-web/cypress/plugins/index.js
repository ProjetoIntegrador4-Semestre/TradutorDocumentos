const wp = require('@cypress/webpack-preprocessor');
const path = require('path');

module.exports = (on, config) => {
  const options = {
    webpackOptions: {
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      }
    }
  };

  on('file:preprocessor', wp(options));

  return config;
};
