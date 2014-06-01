module.exports = (grunt) ->

    # Project configuration.
    grunt.initConfig
        pkg: grunt.file.readJSON('package.json')
        clean:
            all: ['tmp', 'dist']
            tmp: ['tmp']
        coffee:
            default:
                files:
                    'tmp/game.js': ['tmp/game.coffee']
                options:
                    bare: true
            dev:
                files:
                    'tmp/game.js': ['tmp/game.coffee']
                options:
                    bare: true
                    sourceMap: true
        concat:
            default:
                src: [
                    'src/polyfill.coffee'
                    'src/Util.coffee'
                    'src/Core.coffee'
                    'src/IO.coffee'
                    'src/Shape.coffee'
                    'src/Sprite.coffee'
                    'src/Collision.coffee'
                    'src/Layer.coffee'
                    'src/Actor.coffee'
                    'src/Player.coffee'
                    'src/main.coffee'
                ]
                dest: 'tmp/game.coffee'
        copy:
            dev:
                files: [
                    src: ['tmp/game.coffee'], dest: 'dist/game.coffee'
                ,
                    src: ['tmp/game.js'], dest: 'dist/game.js'
                ]
        uglify:
            default:
                options:
                    banner: '/*! <%= pkg.name %> copyright (c) <%= grunt.template.today(\'yyyy\') %> <%= pkg.author %>.  All rights reserved. */\n'
                files:
                    'dist/game.min.js': ['tmp/game.js']
            dev:
                options:
                    banner: '/*! <%= pkg.name %> copyright (c) <%= grunt.template.today(\'yyyy\') %> <%= pkg.author %>.  All rights reserved. */\n'
                    sourceMap: true
                    sourceMapIn: 'tmp/game.js.map'
                files:
                    'dist/game.min.js': ['tmp/game.js']
        watch:
            files: ['src/*']
            tasks: ['dev']


    # Plugins
    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-contrib-coffee')
    grunt.loadNpmTasks('grunt-contrib-concat')
    grunt.loadNpmTasks('grunt-contrib-copy')
    grunt.loadNpmTasks('grunt-contrib-uglify')
    grunt.loadNpmTasks('grunt-contrib-watch')
    

    # Tasks
    grunt.registerTask('default', [
        'clean:all'
        'concat'
        'coffee'
        'uglify'
        'clean:tmp'
    ])
    grunt.registerTask('dev', [
        'clean:all'
        'concat'
        'coffee'
        'uglify'
        'copy'
        'clean:tmp'
    ])
