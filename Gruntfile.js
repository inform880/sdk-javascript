module.exports = function(grunt) {
  var path = require('path');

  grunt.loadNpmTasks('gruntify-eslint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-uglify');


  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      src: ['src/**/*.js']
    },
    browserify: {
      kuzzle: {
        src: ['src/kuzzle.js'],
        dest: 'dist/kuzzle.js',
        options: {
          exclude: ['socket.io-client', 'ws', './src/networkWrapper/wrappers/wsnode.js'],
          browserifyOptions: {
            noParse: [require.resolve('node-uuid')]
          }
        }
      }
    },
    uglify: {
      kuzzle: {
        options: {
          'sourceMap': true,
          'sourceMapName': 'dist/kuzzle.min.map',
          'banner': '// <%= pkg.description %> v<%= pkg.version %> - License: <%= pkg.license %>'
        },
        files: {
          'dist/kuzzle.min.js': ['dist/kuzzle.js']
        }
      }
    }
  });

  grunt.registerTask('default', ['eslint', 'browserify', 'uglify']);
};
