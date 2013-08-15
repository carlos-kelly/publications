module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: ["dist"],

    less: {
      development: {
        options: {
          paths: ["public/stylesheets"],
          yuicompress: false
        },
        files: {
          "public/stylesheets/style.css": "public/stylesheets/style.less"
        }
      },
      production: {
        options: {
          paths: ["public/stylesheets"],
          yuicompress: true
        },
        files: {
          "public/stylesheets/style.css": "public/stylesheets/style.less"
        }
      },
    },

    requirejs: {
      production: {
        options: {
          name: "app",
          mainConfigFile: "public/javascripts/app.js",
          out: "public/javascripts/app.min.js"
        }
      }
    },
  });

  //Load Plugins
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-targethtml');

  //Tasks
  grunt.registerTask('production', ['clean', 'less:production', 'requirejs:production']);
  grunt.registerTask('development', ['clean', 'less:development']);
  grunt.registerTask('default', ['development']);

};