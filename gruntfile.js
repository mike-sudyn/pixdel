module.exports = function(grunt) {
    grunt.initConfig({

        less: {
            development: {
                options: {
                    paths: ["css"]
                },
                files: {"dist/style.css": "assets/styles/*.less"}
            },
            production: {
                options: {
                    paths: ["css"],
                    cleancss: true
                },
                files: {"dist/style.css": "assets/styles/*.less"}
            }
        },

        uglify: {
            build: {
                files: [{
                    src: 'assets/js/*.js',
                    dest: '.tmp/script.js'
                }]
            }
        },

        concat: {
            'dist/script.js': ['assets/js/vendor/*.js', '.tmp/*.js']
        },

        watch: {
            files: ['assets/styles/*', 'assets/js/*'],
            tasks: ['less', 'uglify', 'concat']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['less:production', 'uglify', 'concat']);
};