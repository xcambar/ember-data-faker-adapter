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
      unmin: {
        options: {
          browserifyOptions: {
            standalone: 'XC.FakerAdapter',
            debug: true
          }
        },
        src: './index.js',
        dest: './dist/faker-adapter.js'
      },
      watch: {
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
    },
    watch: {
      devBundle: {
        files: ['./dist/faker-adapter.js'],
        tasks: ['browserify:min']
      }
    },
    concurrent: {
      build: {
        tasks: ['browserify:watch', 'watch'],
        options: {
          logConcurrentOutput: true
        }
      }
    },
    bump: {
      options: {
        files: ['package.json', 'bower.json'],
        commitFiles: ['package.json', 'bower.json'],
        tagName: '%VERSION%',
        push: false
      }
    }
  });
  grunt.registerTask('default', ['concurrent:build']);
  grunt.registerTask('build', ['browserify:unmin', 'browserify:min']);
};
