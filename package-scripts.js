const { devenv } = require('./package.json');

module.exports = {
  scripts: {
    default: {
      script: 'nps parcel.dom.build',
      description: 'Build DOM for production',
    },
    build: {
      script: 'nps clean && nps code.build',
      description: 'Build for production',
    },
    lint: 'eslint src',

    /*
    <==========================================>
    <                    Rollup                   >
    <==========================================>
    */
    code: {
      default: {
        script: 'cross-env NODE_ENV=development rollup -c -w',

        description: 'Development mode',
        hiddenFromHelp: false,
      },

      build: {
        script:
          'nps generateTypes && cross-env NODE_ENV=production rollup -c -w',

        description: 'Production mode',
        hiddenFromHelp: false,
      },
    },
    clean: 'rimraf lib dist es coverage',
    /*
    <==========================================>
    <                    Others                   >
    <==========================================>
    */
    generateTypes: {
      script:
        'jsdoc -t node_modules/tsd-jsdoc/dist -r src/ -d ./',

      description: 'Generate typings file using jsdoc comments',
      hiddenFromHelp: true,
    },
    update: {
      script: 'npx npm-check -u',

      description: 'Package interactive updater',
      hiddenFromHelp: false,
    },
  },
};
