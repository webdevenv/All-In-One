import nodeResolve from 'rollup-plugin-node-resolve';
import globals from 'rollup-plugin-node-globals';
import builtins from 'rollup-plugin-node-builtins';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
// import visualizer from 'rollup-plugin-visualizer';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import url from 'rollup-plugin-url';
import copy from 'rollup-plugin-copy';
import glob from 'glob';
import nodemon from 'nodemon';

import pkg from './package.json';
const { devenv } = pkg;
const productionMode = process.env.NODE_ENV === 'production';

// commonjs: require
// ES: ES6 Imports
// UMD: IIFE

const config = [];
const serveConfig = {
  // Launch in browser (default: false)
  open: true,
  // Folder to serve files from
  contentBase: 'public',
  // Set to true to return index.html (200) instead of error page (404)
  historyApiFallback: true,
  // Path to fallback page
  // historyApiFallback: '/200.html',

  // Options used in setting up server
  host: 'localhost',
  port: devenv.port || 3000,

  // By default server will be served over HTTP (https: false). It can optionally be served over HTTPS
  // https: {
  //   key: fs.readFileSync('/path/to/server.key'),
  //   cert: fs.readFileSync('/path/to/server.crt'),
  //   ca: fs.readFileSync('/path/to/ca.pem'),
  // },

  //set headers
  // headers: {
  //   'Access-Control-Allow-Origin': '*',
  //   foo: 'bar',
  // },
};
const pluginsList = [
  copy({
    targets: [...glob.sync('public/**/*')],
  }),
  postcss(),
  json(),
  url({
    limit: 10 * 1024, // inline files < 10k, copy files > 10k
  }),
  globals(),
  builtins(),
  nodeResolve({
    extensions: ['.mjs', '.js', '.jsx', '.json'],
  }),
  // commonjs({
  //   include: ['node_modules/**', 'src/**'],
  // }),
  babel({
    // exclude: 'node_modules/**',
  }),
  replace({
    'process.env.NODE_ENV': JSON.stringify('production'),
  }),
  boolFunc(
    productionMode,
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
    }),
  ),

  boolFunc(devenv.server && !devenv.node, serve(serveConfig)),
  boolFunc(devenv.server && !devenv.node, livereload()),
  // boolFunc(productionMode, visualizer()),
];

// CommonJs / Require
if (!devenv.application && productionMode) {
  config.push({
    input: 'src/app.js',
    output: {
      file: `lib/${devenv.name}.js`,
      format: 'cjs',
      indent: false,
    },
    external: Object.keys(pkg.dependencies || {}),
    plugins: pluginsList,
  });
}
// ES / ES6 Imports
if (!devenv.application && productionMode) {
  config.push({
    input: 'src/app.js',
    output: {
      file: `es/${devenv.name}.js`,
      format: 'es',
      indent: false,
    },
    external: [
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {}),
    ],
    plugins: pluginsList,
  });
}

// ES / ES6 Imports for Browser
if (!devenv.application && productionMode) {
  config.push({
    input: 'src/app.js',
    output: {
      file: `es/${devenv.name}.mjs`,
      format: 'es',
      indent: false,
    },
    plugins: pluginsList,
  });
}

// UMD / IIFE for Development
if (!productionMode) {
  config.push({
    input: 'src/app.js',
    output: {
      file: `dev/app.js`,
      format: 'umd',
      name: devenv.name,
      indent: false,
      sourcemap: 'inline',
    },
    external: devenv.node
      ? [
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys(pkg.peerDependencies || {}),
        ]
      : [],

    plugins: pluginsList,
  });
}

// UMD / IIFE for Production
if (productionMode) {
  config.push({
    input: 'src/app.js',
    output: {
      file: devenv.application
        ? `prod/app.js`
        : `dist/${devenv.name}.min.js`,
      format: 'umd',
      name: devenv.name,
      indent: false,
    },
    external: [
      ...boolFunc(
        devenv.node,
        [
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys(pkg.peerDependencies || {}),
        ],
        [],
      ),
    ],
    plugins: pluginsList,
  });
}

if (devenv.server && devenv.node) {
  nodemon({
    script: 'dev/app.js',
  });
  // exec: boolFunc(devenv.debug, 'node --inspect', undefined),
  nodemon.on('restart', files => console.clear());
}

export default config;

function boolFunc(ifElm, thenElm, elseElm) {
  if (ifElm && thenElm) {
    return thenElm;
  } else if (elseElm) {
    return elseElm;
  }
  return null;
}
