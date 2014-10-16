'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    browserify: {
      min: {
        options: {
          browserifyOptions: {
            standalone: 'XC.FakerAdapter'
          }
        },
        src: './index.js',
        dest: './dist/faker-adapter.min.js'
      },
      dev: {
        options: {
          watch: true,
          keepAlive: true,
          browserifyOptions: {
            standalone: 'XC.FakerAdapter',
            debug: true
          }
        },
        src: './index.js',
        dest: './dist/faker-adapter.js'
      },
    }
  });
  grunt.registerTask('default', function () {
    console.log('Nothing defined as default yet');
  });
  grunt.registerTask('build', ['browserify']);
};
