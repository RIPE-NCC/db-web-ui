/*global process*/
'use strict';

var fs = require('fs');
var os = require('os');
var serveStatic = require('serve-static');

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

var prismFilename = function (config, req) {
    var crypto = require('crypto');
    // var path = require('path');
    var shasum = crypto.createHash('sha1');
    shasum.update(req.url);
    var digest = shasum.digest('hex');
    return digest + '.json';
};

module.exports = function (grunt) {

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Automatically load required Grunt tasks
    require('jit-grunt')(grunt, {
        useminPrepare: 'grunt-usemin',
        cdnify: 'grunt-google-cdn',
        configureProxies: 'grunt-connect-proxy',
        protractor: 'grunt-protractor-runner',
        instrument: 'grunt-istanbul',
        prism: 'grunt-connect-prism'
    });

    // Configurable paths for the application
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        dist: require('./bower.json').distPath || 'dist',
        tmp:  require('./bower.json').tmpPath || 'tmp'
    };

    // Detect environment for e2e remote process
    var e2eLocalOrRemote = function () {
        return os.hostname().indexOf('db-tools-1.') === 0 ? 'e2eRemote' : 'e2eLocal';
    };

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        yeoman: appConfig,

        ts: {
            default: {
                tsconfig: true
            },
            options: {
                verbose: false
            }
        },
        focus: {
            livereloadServer: {}
        },
        // Watches files for changes and runs tasks based on the changed files
        watch: {
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            js: {
                files: ['<%= yeoman.app %>/scripts/{,*/}{,*/}*.js'],
                tasks: ['newer:jshint:all', 'newer:jscs:all', 'copy:dev'],
                options: {
                    livereload: '<%= connect.options.livereload %>'
                }
            },
            jsTest: {
                files: ['test/unit/{,*/}{,*/}*.js'],
                tasks: ['newer:jshint:test', 'karma']
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
                    '<%= yeoman.tmp %>/assets/css/{,*/}*.css',
                    '<%= yeoman.app %>/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            },
            dist: {
                files: [
                    '<%= yeoman.app %>/scripts/{,*/}{,*/}*.js',
                    '<%= yeoman.app %>/scripts/{,*/}{,*/}*.ts',
                    '<%= yeoman.app %>/assets/scss/{,*/}*.{scss,sass}',
                    '<%= yeoman.app %>/{,*/}{,*/}{,*/}*.html'
                ],
                tasks: [
                    'clean:server',
                    'copy:processtags',
                    'wiredep',
                    'compass',
                    'postcss',
                    'ts',
                    'concat',
                    'copy:dist',
                    'cssmin'
                ]
            }
        },

        prism: {
            options: {
                host: 'localhost.ripe.net',
                port: 0,
                https: false,
                mocksPath: './test/e2e/mocks',
                useApi: true,
                mockFilenameGenerator: prismFilename
            },
            e2eTest: {
                options: {
                    mode: 'mock',
                    context: '/api'
                }
            }
        },

        // The actual grunt server settings
        connect: {
            options: {
                port: 9080,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: '0.0.0.0'
            },
            livereload: {
                options: {
                    open: false,
                    middleware: function (connect) {
                        return [
                            serveStatic('<%= yeoman.tmp %>'),
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
                    port: 0,
                    keepalive: false,
                    //open: true,
                    middleware: function (connect) {
                        return [
                            //require('grunt-connect-proxy/lib/utils').proxyRequest,
                            require('grunt-connect-prism/middleware'),
                            serveStatic('instrumented/' + appConfig.tmp),
                            serveStatic(appConfig.tmp),
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
                    jshintrc: 'test/.jshintrc'
                },
                src: ['test/{,*/}*.js']
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
                        '<%= yeoman.dist %>/{,*/}*',
                        '!<%= yeoman.dist %>/.git{,*/}*'
                    ]
                }]
            },
            server: {
                files: [{
                    dot: true,
                    src: [
                        '<%= yeoman.tmp %>',
                        'instrumented'
                    ]
                }]
            }
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
                    cwd: '<%= yeoman.tmp %>/styles/',
                    src: '{,*/}*.css',
                    dest: '<%= yeoman.tmp %>/styles/'
                }]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.tmp %>/styles/',
                    src: '{,*/}*.css',
                    dest: '<%= yeoman.tmp %>/styles/'
                }]
            }
        },

        // Automatically inject Bower components into the app
        wiredep: {
            app: {
                src: ['<%= yeoman.tmp %>/index.html'],
                ignorePath: /\.\.\//
            },
            test: {
                devDependencies: true,
                src: '<%= karma.unit.configFile %>',
                ignorePath: /\.\.\//,
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
                cssDir: '<%= yeoman.tmp %>/assets/css',
                generatedImagesDir: '<%= yeoman.tmp %>/images/generated',
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
                cacheDir: '<%= yeoman.tmp %>/sass-cache'
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
            html: '<%= yeoman.tmp %>/index.html',
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
                    js: [[/(images\/[^'"]*\.(png|jpg|jpeg|gif|webp|svg))/g, 'Replacing references to images']]
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
                        '<%= yeoman.tmp %>/assets/css/{,*/}*.css'
                    ]
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/scripts/scripts.js': [
                        '<%= yeoman.tmp %>/scripts/{,*/}{,*/}*.js'
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
                    cwd: '<%= yeoman.tmp %>/scripts',
                    src: ['{,*/}{,*/}*.html'],
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },

        ngtemplates: {
            dist: {
                options: {
                    module: 'dbWebApp',
                    htmlmin: '<%= htmlmin.dist.options %>',
                    usemin: 'scripts/scripts.js'
                },
                cwd: '<%= yeoman.app %>',
                src: 'scripts/{,*/}{,*/}*.html',
                dest: '<%= yeoman.tmp %>/templateCache.js'
            }
        },

        // ng-annotate tries to make the code safe for minification automatically
        // by using the Angular long form for dependency injection.
        ngAnnotate: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.tmp %>/concat/scripts',
                    src: '*.js',
                    dest: '<%= yeoman.tmp %>/concat/scripts'
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
            dev: {
                expand: true,
                dot: true,
                cwd: '<%= yeoman.app %>',
                dest: '<%= yeoman.tmp %>',
                src: 'scripts/**/*.js'
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt,htaccess}',
                        'scripts/{,*/}{,*/}*.html'
                    ]
                }, {
                    // needed until bower js is minified...
                    expand: true,
                    src: 'bower_components/**',
                    dest: '<%= yeoman.dist %>/'
                }, {
                    src: '<%= yeoman.tmp %>/index.html',
                    dest: '<%= yeoman.dist %>/index.html'
                }, {
                    expand: true,
                    cwd: '<%= yeoman.tmp %>',
                    src: 'scripts/**/*.{js,map}',
                    dest: '<%= yeoman.dist %>/'
                }, {
                    expand: true,
                    cwd: '<%= yeoman.tmp %>/images/**',
                    dest: '<%= yeoman.dist %>/images/',
                    src: ['generated/*']
                }]
            },
            styles: {
                expand: true,
                cwd: '<%= yeoman.app %>/assets/css',
                dest: '<%= yeoman.tmp %>/assets/css/',
                src: '{,*/}*.css'
            },
            processtags: {
                files: [{
                    src: '<%= yeoman.app %>/template.html',
                    dest: '<%= yeoman.tmp %>/index.html'
                }],
                options: {
                    process: function (content, path) {
                        var dir = path.substring(0, path.lastIndexOf('/'));
                        var keeplooping;

                        function substituteText(m, filename) {
                            keeplooping = true;
                            return fs.readFileSync(dir + '/' + filename).toString();
                        }

                        function maybeSubstituteText(m, condition, trueFile, falseFile) {
                            keeplooping = true;
                            var filename = grunt.config(condition) ? trueFile : falseFile;
                            return filename ? fs.readFileSync(dir + '/' + filename).toString() : '';
                        }

                        do {
                            keeplooping = false;
                            // First, process the includes such as <!-- @include _index_app_body_start.html -->
                            content = content.replace(/<!--\s*@include\s+([\S]+)\s*-->/g, substituteText);
                            // Second, process the conditional includes: <!-- @includeif OPTION fileIfTrue fileIfFalse -->
                            // OPTION is a config value set in this file, e.g. grunt.config("grunt.app.e2e", true);
                            // fileIfFalse can be empty, in which case includeif is like an on/off switch instead of a toggle
                            content = content.replace(/<!--\s*@includeif\s+([\S]+)\s+([\S]+)(?:\s+([\S]+))?\s*-->/g, maybeSubstituteText);
                        } while (keeplooping);

                        // Then expand Grunt tags, i.e. <%= value %>
                        return grunt.template.process(content);
                    }
                }
            }
        },

        md2html: {
            one_file: {
                options: {
                    layout: 'md-template.html'
                },
                files: [{
                    src: ['../README.md'],
                    dest: '../README.html'
                }]
            }
        },

        cacheBust: {
            options: {
                baseDir: './<%= yeoman.dist %>',
                encoding: 'utf8',
                algorithm: 'md5',
                length: 16,
                queryString: true,
                assets: ['**/*.js', '**/*.css', '**/*.png']
            },
            src: ['./<%= yeoman.dist %>/index.html']
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
                args: {
                    baseUrl: 'http://localhost:0',
                    chromeDriver: './test/lib/webdrivers/' + process.platform + '/chromedriver' + (process.platform === 'win32' ? '.exe' : ''),
                    seleniumServerJar: './test/lib/selenium-server-standalone-3.12.0.jar'
                }
            },
            e2e: {
                options: {
                    configFile: './test/protractor-e2e.conf.js', // Default config file
                    keepAlive: false // If false, the grunt process stops when the test fails.
                }
            },
            noTest: {
                options: {
                    configFile: 'test/protractor-no-test.conf.js', // Default config file
                    keepAlive: true
                }
            }
        },

        // E2E config
        protractor_coverage: {
            options: {
                keepAlive: true,
                noColor: false,
                collectorPort: 3001,
                coverageDir: 'reports/e2e-coverage',
                args: {
                    baseUrl: 'http://' + os.hostname() + ':0'
                }
            },
            e2eLocal: {
                options: {
                    configFile: 'test/protractor-e2e-coverage-local.conf.js',
                    args: {
                        baseUrl: 'http://localhost:0',
                        chromeDriver: './test/lib/webdrivers/' + process.platform + '/chromedriver' + (process.platform === 'win32' ? '.exe' : ''),
                        seleniumServerJar: './test/lib/selenium-server-standalone-3.12.0.jar'
                    }
                }
            },
            e2eHeadless: {
                options: {
                    configFile: '/home/dbase/GRUNT/protractor-e2e-coverage-headless.conf.js'
                }
            },
            e2eRemote: {
                options: {
                    configFile: 'test/protractor-e2e-coverage-remote.conf.js'
                }
            }
        },

        instrument: {
            files: '<%= yeoman.tmp %>/scripts/**/*.js',
            options: {
                lazy: true,
                basePath: 'instrumented'
            }
        },

        makeReport: {
            src: 'reports/e2e-coverage/*.json',
            options: {
                type: 'lcov',
                dir: 'reports/e2e-coverage',
                print: 'detail'
            }
        },

        // Range from 9000 - 9099 available through msw7 / db-tools-2 firewall
        // 9080 reserved for grunt serve
        portPick: {
            options: {
                port: 9002,
                limit: 76
            },
            protractor: {
                targets: [
                    'prism.options.port',
                    'connect.e2e.options.port',
                    'protractor.options.args.baseUrl',
                    'protractor_coverage.options.args.baseUrl',
                    'protractor_coverage.e2eLocal.options.args.baseUrl'
                ]
            },
            karma: {
                targets: [
                    'karma.options.port'
                ]
            }
        },

        karma: {
            options: {
                port: 0
            },
            unit: {
                configFile: 'test/karma.conf.js',
                singleRun: true
            }
        }
    });

    grunt.config('grunt.build.tag', grunt.option('buildtag') || 'empty_tag');

    grunt.registerTask('e2e-test', 'Runs all the E2E tests with Protractor', [
        'clean:server',
        'copy:processtags',
        'copy:dev',
        'ts',
        'wiredep',
        'portPick:protractor',
        'concurrent:server',
        'prism',
        'connect:e2e',
        'protractor:e2e'
    ]);

    grunt.registerTask('e2e-coverage', 'Runs E2E tests and shows coverage data', [
        'clean:server',
        'copy:processtags',
        'copy:dev',
        'ts',
        'wiredep:sass',
        'instrument',
        'compass',
        'portPick:protractor',
        'prism',
        'connect:e2e',
        'protractor_coverage:' + e2eLocalOrRemote(),
        'makeReport'
    ]);

    grunt.registerTask('e2e-coverage-headless', 'Not working. Should run Protractor on a headless browser', [
        'clean:server',
        'copy:processtags',
        'copy:dev',
        'ts',
        'wiredep:sass',
        'instrument',
        'compass',
        'portPick:protractor',
        'prism',
        'connect:e2e',
        'protractor_coverage:e2eHeadless',
        'makeReport'

    ]);

    grunt.registerTask('e2e-no-test', 'Start a server using E2E mocks for debugging purposes', [
        'clean:server',
        'copy:processtags',
        'copy:dev',
        'ts',
        'wiredep',
        'portPick:protractor',
        'concurrent:server',
        'prism',
        'connect:e2e:keepalive'
    ]);

    grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean',
            'copy:processtags',
            'copy:dev',
            'wiredep',
            'useminPrepare',
            'concurrent:dist',
            'concat',
            'copy:dist',
            'cssmin',
            'configureProxies:livereload',
            'connect:livereload',
            'focus:livereloadServer'
        ]);
    });

    grunt.registerTask('server', 'DEPRECATED TASK. Use the "serve" task instead', function (target) {
        grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
        grunt.task.run(['serve:' + target]);
    });

    grunt.registerTask('test', 'Run unit tests with Karma', [
        'clean:server',
        'copy:processtags',
        'copy:dev',
        'ts',
        'wiredep',
        'concurrent:test',
        'postcss',
        'portPick:karma',
        'karma'
    ]);

    grunt.registerTask('build', 'Do a full clean, compile, build', [
        'clean',
        'md2html',
        'copy:processtags',
        'copy:dev',
        'ts',
        'wiredep',
        'useminPrepare',
        'concurrent:dist',
        'cssmin',
        'postcss',
        'copy:dist',
        'htmlmin',
        'cacheBust'
    ]);

    grunt.registerTask('default', [
        'newer:jshint',
        'test',
        'build'
    ]);

};
