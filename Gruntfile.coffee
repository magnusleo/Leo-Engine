module.exports = (grunt) ->

    # Project configuration.
    grunt.initConfig
        pkg: grunt.file.readJSON('package.json')
        clean:
            default: ['dist']
        browserify:
            default:
                files:
                    'dist/game.js': ['src/main.coffee']
                options:
                    transform: ['coffeeify']
                    browserifyOptions:
                        extensions: ['.coffee']
                        debug: true
        uglify:
            default:
                options:
                    banner: '/*! <%= pkg.name %> copyright (c) <%= grunt.template.today(\'yyyy\') %> <%= pkg.author %>.  All rights reserved. */\n'
                files:
                    'dist/game.min.js': ['dist/game.js']
        watch:
            files: ['src/**']
            tasks: ['dev']


    # Plugins
    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-watch')
    grunt.loadNpmTasks('grunt-browserify')
    

    # Tasks
    grunt.registerTask('default', [
        'clean'
        'browserify'
        'uglify'
    ])

    grunt.registerTask('dev', [
        'clean'
        'browserify'
    ])
