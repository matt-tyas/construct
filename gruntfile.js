module.exports = function(grunt) {

    // 1. All configuration goes here 
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),

    concat: {   
      dist: {
        src: [
            'js/libs/*.js', // All JS in the libs folder
            'js/global.js'  // This specific file
        ],
        dest: 'js/build/production.js',
      }
    },

    uglify: {
      build: {
        src: 'js/build/production.js',
        dest: 'js/build/production.min.js'
      }
    },

    sass: {
      dist: {
        options: {
          style: 'expanded'
      },
        files: {
          'style.css': 'scss/style.scss'
        }
      } 
    },

    watch: {
      options: {
        livereload: true,
      },
      // images: {
      //   files: ['images/**']
      // },
      css: {
        files: '**/*.scss',
        tasks: ['sass:dist']
      },
      // scripts: {
      //   files: ['scripts/{,**/}*.js', '!scripts/{,**/}*.min.js', '!scripts/dist/{,**/}*'],
      //   tasks: ['uglify:dev'],
      //   options: {
      //     spawn: false
      //   }
      // },
      // registry: {
      //   files: ['*.info', '{,**}/*.{php,inc,tpl.php}'],
      //   options: {
      //     livereload: true
      //   }
      // },
    } // end watch

  });

  // 3. Where we tell Grunt we plan to use this plug-in.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
  grunt.registerTask('default', ['concat']);
  grunt.registerTask('default', ['concat', 'uglify']);
  grunt.registerTask('default', ['sass']);
  grunt.registerTask('default', ['watch']);

  // default task
  grunt.registerTask('default', [
    'dev'
  ]);

  // Development task
  grunt.registerTask('dev', [
    'sass:dist',
    'watch'
  ]);

};