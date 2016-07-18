// Generated on 2016-07-05 using generator-angular 0.15.1
'use strict';

var fs = require('fs');
var serveStatic = require('serve-static');

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Automatically load required Grunt tasks
    require('jit-grunt')(grunt, {
        useminPrepare: 'grunt-usemin',
        ngtemplates: 'grunt-angular-templates',
        cdnify: 'grunt-google-cdn',
        configureProxies: 'grunt-connect-proxy',
        protractor: 'grunt-protractor-runner'
    });

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        dist: require('./bower.json').distPath || 'dist'
    };

    var environments = {
        dev: {
            ENV: 'dev',
            GTM_ID: 'GTM-WTWTB7',
            ACCESS_URL: 'https://access.prepdev.ripe.net?originalUrl=https://dev.db.ripe.net/db-web-ui/',
            LOGIN_URL: 'https://access.prepdev.ripe.net/',
            PORTAL_URL: 'https://my.prepdev.ripe.net/'
        },
        prepdev: {
            ENV: 'prepdev',
            GTM_ID: 'GTM-WTWTB7',
            ACCESS_URL: 'https://access.prepdev.ripe.net?originalUrl=https://prepdev.db.ripe.net/db-web-ui/',
            LOGIN_URL: 'https://access.prepdev.ripe.net/',
            PORTAL_URL: 'https://my.prepdev.ripe.net/'
        },
        rc: {
            ENV: 'rc',
            GTM_ID: 'GTM-T5J6RH',
            ACCESS_URL: 'https://access.ripe.net?originalUrl=https://rc.db.ripe.net/db-web-ui/',
            LOGIN_URL: 'https://access.ripe.net/',
            PORTAL_URL: 'https://my.ripe.net/'
        },
        test: {
            ENV: 'test',
            GTM_ID: 'GTM-W4MMHJ',
            ACCESS_URL: 'https://access.ripe.net?originalUrl=https://apps-test.db.ripe.net/db-web-ui/',
            LOGIN_URL: 'https://access.ripe.net/',
            PORTAL_URL: 'https://my.ripe.net/'
        },
        prod: {
            ENV: 'prod',
            GTM_ID: 'GTM-TP3SK6',
            ACCESS_URL: 'https://access.ripe.net?originalUrl=https://apps.db.ripe.net/db-web-ui/',
            LOGIN_URL: 'https://access.ripe.net/',
            PORTAL_URL: 'https://my.ripe.net/'
        }
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: appConfig,

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            js: {
                files: ['<%= yeoman.app %>/scripts/{,*/}{,*/}*.js'],
                tasks: ['newer:jshint:all', 'newer:jscs:all'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            jsTest: {
                files: ['src/test/javascript/unit/{,*/}{,*/}*.js'],
                tasks: ['newer:jshint:test', 'newer:jscs:test', 'karma']
            },
            compass: {
                files: ['<%= yeoman.app %>/assets/scss/{,*/}*.{scss,sass}'],
                tasks: ['compass:server', 'postcss:server']
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= yeoman.app %>/{,*/}{,*/}{,*/}*.html',
                    '.tmp/assets/css/{,*/}*.css',
                    '<%= yeoman.app %>/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9080,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                livereload: 35729
            },
            livereload: {
                options: {
                    open: false,
                    middleware: function (connect) {
                        return [
                            serveStatic('.tmp'),
                            connect().use(
                                '/bower_components',
                                serveStatic('./bower_components')
                            ),
                            serveStatic(appConfig.app),
                            require('grunt-connect-proxy/lib/utils').proxyRequest
                        ];
                    }
                },
                proxies: [{
                    host: 'localhost',
                    context: '/api',
                    port: 8443,
                    https: true,
                    //xforward: true,
                    rewrite: {
                        '^/api': '/db-web-ui/api'
                    }
                }]
            },
            e2e: {
                options: {
                    port: 9004,
                    keepalive: false,
                    //open: true,
                    middleware: function (connect) {
                        return [
                            //require('grunt-connect-proxy/lib/utils').proxyRequest,
                            serveStatic('.tmp'),
                            connect().use(
                                '/bower_components',
                                serveStatic('./bower_components')
                            ),
                            serveStatic(appConfig.app)
                        ];
                    }
                }
            },
            test: {
                options: {
                    port: 9002,
                    middleware: function (connect) {
                        return [
                            serveStatic('.tmp'),
                            serveStatic('test'),
                            connect().use(
                                '/bower_components',
                                serveStatic('./bower_components')
                            ),
                            serveStatic(appConfig.app)
                        ];
                    }
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= yeoman.dist %>'
                }
            }
        },

        // Make sure there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            all: {
                src: [
                    'Gruntfile.js',
                    '<%= yeoman.app %>/scripts/{,*/}*.js'
                ]
            },
            test: {
                options: {
                    jshintrc: 'src/test/javascript/.jshintrc'
                },
                src: ['src/test/javascript/{,*/}*.js']
            }
        },

        // Make sure code styles are up to par
        jscs: {
            options: {
                config: '.jscsrc',
                verbose: true
            },
            all: {
                src: [
                    'Gruntfile.js',
                    '<%= yeoman.app %>/scripts/{,*/}*.js'
                ]
            },
            test: {
                src: ['test/spec/{,*/}*.js']
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/{,*/}*',
                        '!<%= yeoman.dist %>/.git{,*/}*'
                    ]
                }]
            },
            server: '.tmp'
        },

        // Add vendor prefixed styles
        postcss: {
            options: {
                processors: [
                    require('autoprefixer')({browsers: ['last 1 version']})
                ]
            },
            server: {
                options: {
                    map: true
                },
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/styles/',
                    src: '{,*/}*.css',
                    dest: '.tmp/styles/'
                }]
            }
        },

        // Automatically inject Bower components into the app
        wiredep: {
            app: {
                src: ['.tmp/index.html'],
                ignorePath: /\.\.\//
            },
            test: {
                devDependencies: true,
                src: '<%= karma.unit.configFile %>',
                ignorePath: /\.\.\/\.\.\/\.\.\//,
                fileTypes: {
                    js: {
                        block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
                        detect: {
                            js: /'(.*\.js)'/gi
                        },
                        replace: {
                            js: '\'{{filePath}}\','
                        }
                    }
                }
            },
            sass: {
                src: ['<%= yeoman.app %>/assets/scss/{,*/}*.{scss,sass}'],
                ignorePath: /(\.\.\/){1,2}bower_components\//
            }
        },

        // Compiles Sass to CSS and generates necessary files if requested
        compass: {
            options: {
                sassDir: '<%= yeoman.app %>/assets/scss',
                cssDir: '.tmp/assets/css',
                generatedImagesDir: '.tmp/images/generated',
                imagesDir: '<%= yeoman.app %>/assets/images',
                javascriptsDir: '<%= yeoman.app %>/scripts',
                fontsDir: '<%= yeoman.app %>/assets/fonts',
                importPath: './bower_components',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/styles/fonts',
                relativeAssets: false,
                assetCacheBuster: false,
                raw: 'Sass::Script::Number.precision = 10\n',
                cacheDir: '.tmp/sass-cache'
            },
            dist: {
                options: {
                    generatedImagesDir: '<%= yeoman.dist %>/images/generated'
                }
            },
            server: {
                options: {
                    sourcemap: true
                }
            }
        },

        // Renames files for browser caching purposes
        filerev: {
            dist: {
                src: [
                    '<%= yeoman.dist %>/scripts/{,*/}*.js',
                    '<%= yeoman.dist %>/styles/{,*/}*.css',
                    '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
                    '<%= yeoman.dist %>/styles/fonts/*'
                ]
            }
        },

        // Reads HTML for usemin blocks to enable smart builds that automatically
        // concat, minify and revision files. Creates configurations in memory so
        // additional tasks can operate on them
        useminPrepare: {
            html: '.tmp/index.html',
            options: {
                dest: '<%= yeoman.dist %>',
                flow: {
                    html: {
                        steps: {
                            js: ['concat', 'uglifyjs'],
                            css: ['cssmin']
                        },
                        post: {}
                    }
                }
            }
        },

        // Performs rewrites based on filerev and the useminPrepare configuration
        usemin: {
            html: ['<%= yeoman.dist %>/{,*/}{,*/}*.html'],
            css: ['<%= yeoman.dist %>/assets/css/{,*/}*.css'],
            js: ['<%= yeoman.dist %>/scripts/{,*/}{,*/}*.js'],
            options: {
                assetsDirs: [
                    '<%= yeoman.dist %>/assets/images',
                    '<%= yeoman.dist %>/assets/css'
                ],
                patterns: {
                    js: [[/(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']]
                }
            }
        },

        // The following *-min tasks will produce minified files in the dist folder
        // By default, your `index.html`'s <!-- Usemin block --> will take care of
        // minification. These next options are pre-configured if you do not wish
        // to use the Usemin blocks.
        cssmin: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/assets/css/main.css': [
                        '.tmp/assets/css/{,*/}*.css'
                    ]
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/scripts/scripts.js': [
                        '<%= yeoman.dist %>/scripts/scripts.js'
                    ]
                }
            }
        },
        concat: {
            dist: {}
        },

        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/assets/images',
                    src: '{,*/}*.{png,jpg,jpeg,gif}',
                    dest: '<%= yeoman.dist %>/assets/images'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/assets/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/assets/images'
                }]
            }
        },

        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true,
                    conservativeCollapse: true,
                    collapseBooleanAttributes: true,
                    removeCommentsFromCDATA: true,
                    removeComments: true
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.dist %>',
                    src: ['{,*/}{,*/}*.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },

        ngtemplates: {
            dist: {
                options: {
                    module: 'whoisUiApp',
                    htmlmin: '<%= htmlmin.dist.options %>',
                    usemin: 'scripts/scripts.js'
                },
                cwd: '<%= yeoman.app %>',
                src: 'scripts/{,*/}{,*/}*.html',
                dest: '.tmp/templateCache.js'
            }
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '.tmp/concat/scripts',
                    src: '*.js',
                    dest: '.tmp/concat/scripts'
                }]
            }
        },

        // Replace Google CDN references
        cdnify: {
            dist: {
                html: ['<%= yeoman.dist %>/*.html']
            }
        },

        // Copies remaining files to places other tasks can use
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt,htaccess}',
                        'scripts/{,*/}{,*/}*.js',
                        '!scripts/app.constants.js', // this needs additional processing so don't copy it from yeoman.app
                        'scripts/{,*/}{,*/}*.html',
                        'selectize/{,*/}{,*/}*.html',
                        'images/{,*/}*.{webp}',
                        'styles/fonts/{,*/}*.*'
                    ]
                }, {
                    // needed until bower js is minified...
                    expand: true,
                    src: 'bower_components/**',
                    dest: '<%= yeoman.dist %>/'
                }, {
                    src: '.tmp/index.html',
                    dest: '<%= yeoman.dist %>/index.html'
                }, {
                    // copy processed js files from tmp to dist (incl app.constants.js)
                    expand: true,
                    cwd: '.tmp/scripts',
                    src: '*.js',
                    dest: '<%= yeoman.dist %>/scripts/'
                }, {
                    expand: true,
                    cwd: '.tmp/images/**',
                    dest: '<%= yeoman.dist %>/images/',
                    src: ['generated/*']
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/assets/css',
                dest: '.tmp/assets/css/',
                src: '{,*/}*.css'
            },
            processtags: {
                files: [{
                    src: '<%= yeoman.app %>/template.html',
                    dest: '.tmp/index.html'
                }, {
                    src: '<%= yeoman.app %>/scripts/app.constants.js',
                    dest: '.tmp/scripts/app.constants.js'
                }],
                options: {
                    process: function (content, path) {
                        var dir = path.substring(0, path.lastIndexOf('/'));
                        // First, process the includes such as <!-- @include _index_app_body_start.html -->
                        content = content.replace(/<!--\s*@include\s+([\S]+)\s*-->/g, function (m, filename) {
                            return fs.readFileSync(dir + '/' + filename).toString();
                        });
                        // Second, process the conditional includes: <!-- @includeif CONDITION fileIfTrue, fileIfFalse -->
                        content = content.replace(/<!--\s*@includeif\s+([\S]+)\s+([\S]+)\s+([\S]+)\s*-->/g, function (m, condition, trueFile, falseFile) {
                            var filename = grunt.config(condition) ? trueFile : falseFile;
                            return fs.readFileSync(dir + '/' + filename).toString();
                        });
                        // Third, replace @echo directives with values from environment constants
                        content = content.replace(/<!--\s*@echo\s+([\S]+)\s*-->/g, function (m, group) {
                            return grunt.config('grunt.environment')[group] || '';
                        });
                        // Then expand Grunt tags, i.e. <%= value %>
                        return grunt.template.process(content);
                    }
                }
            }
        },

        cacheBust: {
            options: {
                baseDir: './src/main/webapp',
                //ignorePatterns: ['index_tmpl.html'],
                encoding: 'utf8',
                algorithm: 'md5',
                length: 16,
                queryString: true,
                assets: ['**/*.js', '**/*.css', '**/*.png']
            },
            src: ['./src/main/webapp/index.html']
        },

        // Run some tasks in parallel to speed up the build process
        concurrent: {
            server: [
                'compass:server'
            ],
            test: [
                'compass'
            ],
            dist: [
                'compass:dist',
                'imagemin',
                'svgmin'
            ]
        },

        // Test settings
        protractor: {
            options: {
                noColor: false, // If true, protractor will not use colors in its output.
                args: {}
            },
            e2e: {
                options: {
                    configFile: 'src/test/javascript/protractor-e2e.conf.js', // Default config file
                    keepAlive: false // If false, the grunt process stops when the test fails.
                }
            },
            noTest: {
                options: {
                    configFile: 'src/test/javascript/protractor-no-test.conf.js', // Default config file
                    keepAlive: true
                }
            }
        },

        karma: {
            unit: {
                configFile: 'src/test/javascript/karma.conf.js',
                singleRun: true
            }
        }
    });

    grunt.config('grunt.build.tag', grunt.option('buildtag') || 'empty_tag');
    grunt.config('grunt.environment', environments[grunt.option('environment') || process.env.GRUNT_ENV || 'dev'] || environments.dev);

    grunt.registerTask('e2eapp', 'Sets flag signalling E2E testing to other Grunt tasks', function () {
        grunt.config('grunt.app.e2e', true);
    });

    grunt.registerTask('e2e-test', [
        'clean:server',
        'e2eapp',
        'copy:processtags',
        'wiredep',
        'concurrent:server',
        'connect:e2e',
        'protractor:e2e'
    ]);

    grunt.registerTask('e2e-no-test', [
        'clean:server',
        'e2eapp',
        'copy:processtags',
        'wiredep',
        'concurrent:server',
        'connect:e2e:keepalive'
    ]);

    grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'copy:processtags',
            'wiredep',
            'concurrent:server',
            'postcss:server',
            'configureProxies:livereload',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('test', [
        'clean:server',
        'copy:processtags',
        'wiredep',
        'concurrent:test',
        'postcss',
        'connect:test',
        'karma'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'copy:processtags',
        'wiredep',
        'useminPrepare',
        'concurrent:dist',
        'postcss',
        //'ngtemplates',
        'concat',
        'ngAnnotate',
        'copy:dist',
        //'cdnify',
        'cssmin',
        //'uglify',
        //'filerev',
        //'usemin',
        'htmlmin',
        'cacheBust'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'newer:jscs',
        'test',
        'build'
    ]);
};
