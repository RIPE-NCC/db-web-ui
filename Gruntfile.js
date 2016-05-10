// Generated on 2015-05-18 using generator-jhipster 2.11.0
'use strict';
var fs = require('fs');
var serveStatic = require('serve-static');

var parseString = require('xml2js').parseString;

// Returns the second occurrence of the version number
var parseVersionFromPomXml = function () {
    var pomXml = fs.readFileSync('pom.xml', 'utf8');
    parseString(pomXml, function (err, result) {
        return result.project.version[0];
    });
};

module.exports = function (grunt) {

    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);

// Configurable paths for the application
    var hostname = 'localhost.ripe.net';
    var appConfig = {
        app: require('./bower.json').appPath || 'app',
        dist: 'src/main/webapp/dist'
    };
    var proxyMiddleware = function (req, res, next) {
        console.log('req', req.headers);
        next();
    };

    grunt.initConfig({
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

        protractor: {
            options: {
                noColor: false, // If true, protractor will not use colors in its output.
                args: {}
            },
            e2e: {   // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
                options: {
                    configFile: 'src/test/javascript/protractor-e2e.conf.js', // Default config file
                    keepAlive: false // If false, the grunt process stops when the test fails.
                }
            },
            noTest: {   // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
                options: {
                    configFile: 'src/test/javascript/protractor-no-test.conf.js', // Default config file
                    keepAlive: true
                }
            }
        },

        protractor_coverage: {
            options: {
                keepAlive: true,
                noColor: false,
                collectorPort: 3001,
                coverageDir: 'reports/e2e-coverage',
                args: {
                    baseUrl: 'http://localhost:9002'
                }
            },
            e2e: {
                options: {
                    configFile: 'src/test/javascript/protractor-e2e-coverage.conf.js'
                }
            }
        },

        instrument: {
            files: 'scripts/**/*.js',
            options: {
                cwd: 'src/main/webapp',
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

        yeoman: {
            // configurable paths
            app: appConfig.app,
            dist: appConfig.dist
        },
        watch: {
            options: {
                livereload: true
            },
            bower: {
                files: ['bower.json'],
                tasks: ['wiredep']
            },
            ngconstant: {
                files: ['Gruntfile.js', 'pom.xml'],
                tasks: ['ngconstant:dev']
            },
            css: {
                files: ['**/*.{scss,sass}'],
                tasks: ['compass']
            },
            karma: {
                files: ['src/test/javascript/spec/*.js'],
                tasks: ['karma:continuous:run']
            },
            protractor: {
                files: ['src/test/javascript/e2e/*.js'],
                tasks: ['protractor:e2e']
            }
        },
        wiredep: {
            app: {
                src: ['src/main/webapp/index.html', 'src/main/scss/main.scss'],
                exclude: [
                    /angular-i18n/, // localizations are loaded dynamically
                    /swagger-ui/,
                    'bower_components/bootstrap/' // Exclude Bootstrap LESS as we use bootstrap-sass
                ],
                ignorePath: /\.\.\/webapp\/bower_components\// // remove ../webapp/bower_components/ from paths of injected sass files
            },
            test: {
                src: 'src/test/javascript/karma.conf.js',
                exclude: [/angular-i18n/, /swagger-ui/, /angular-scenario/],
                ignorePath: /\.\.\/\.\.\//, // remove ../../ from paths of injected javascripts
                devDependencies: true,
                fileTypes: {
                    js: {
                        block: /(([\s\t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
                        detect: {
                            js: /'(.*\.js)'/gi
                        },
                        replace: {
                            js: '\'{{filePath}}\','
                        }
                    }
                }
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp',
            e2e: {
                files: [{
                    dot: true,
                    src: [
                        'instrumented/*',
                        'reports/e2e-coverage'
                    ]
                }]
            },
            unittest: {
                files: [{
                    dot: true,
                    src: [
                        'reports/unittest-coverage'
                    ]
                }]
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            app: [
                'src/main/webapp/scripts/app/**/*.js'
            ]
        },
        compass: {
            options: {
                sassDir: 'src/main/webapp/assets/scss',
                cssDir: 'src/main/webapp/assets/css'
            },
            server: {
                options: {
                    outputStyle: 'compressed'
                }
            }
        },
        ngtemplates: {
            dist: {
                cwd: 'src/main/webapp',
                src: ['scripts/app/**/*.html'],
                dest: '.tmp/templates/templates.js',
                options: {
                    module: 'dbWebApp',
                    usemin: 'scripts/app.js',
                    htmlmin: {
                        removeCommentsFromCDATA: true,
                        // https://github.com/yeoman/grunt-usemin/issues/44
                        collapseWhitespace: true,
                        collapseBooleanAttributes: true,
                        conservativeCollapse: true,
                        removeAttributeQuotes: true,
                        removeRedundantAttributes: true,
                        useShortDoctype: true,
                        removeEmptyAttributes: true
                    }
                }
            }
        },
        karma: {
            unit: {
                configFile: 'src/test/javascript/karma.conf.js',
                singleRun: true
            }
        },
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
        buildcontrol: {
            options: {
                commit: true,
                push: false,
                connectCommits: false,
                message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
            },
            openshift: {
                options: {
                    dir: 'deploy/openshift',
                    remote: 'openshift',
                    branch: 'master'
                }
            }
        },
        env: {
            dev: {
                NODE_ENV: 'dev',
                GTM_ID: 'GTM-WTWTB7',
                ACCESS_URL: 'https://access.prepdev.ripe.net?originalUrl=https://dev.db.ripe.net/db-web-ui/'
            },
            prepdev: {
                NODE_ENV: 'prepdev',
                GTM_ID: 'GTM-WTWTB7',
                ACCESS_URL: 'https://access.prepdev.ripe.net?originalUrl=https://prepdev.db.ripe.net/db-web-ui/'
            },
            rc: {
                NODE_ENV: 'rc',
                GTM_ID: 'GTM-T5J6RH',
                ACCESS_URL: 'https://access.ripe.net?originalUrl=https://rc.db.ripe.net/db-web-ui/'
            },
            test: {
                NODE_ENV: 'test',
                GTM_ID: 'GTM-W4MMHJ',
                ACCESS_URL: 'https://access.ripe.net?originalUrl=https://apps-test.db.ripe.net/db-web-ui/'
            },
            prod: {
                NODE_ENV: 'prod',
                GTM_ID: 'GTM-TP3SK6',
                ACCESS_URL: 'https://access.ripe.net?originalUrl=https://apps.db.ripe.net/db-web-ui/'
            }
        },
        ngconstant: {
            options: {
                name: 'dbWebApp',
                deps: false,
                wrap: '\'use strict\';\n// DO NOT EDIT THIS FILE, EDIT THE GRUNT TASK NGCONSTANT SETTINGS INSTEAD WHICH GENERATES THIS FILE\n{%= __ngModule %}'
            },
            dev: {
                options: {
                    dest: 'src/main/webapp/scripts/app/app.constants.js'
                },
                constants: {
                    ENV: 'dev',
                    SOURCE: 'RIPE',
                    VERSION: parseVersionFromPomXml(),
                    LOGIN_URL: 'https://access.prepdev.ripe.net/'
                }
            },
            prepdev: {
                options: {
                    dest: 'src/main/webapp/scripts/app/app.constants.js'
                },
                constants: {
                    ENV: 'prepdev',
                    SOURCE: 'RIPE',
                    VERSION: parseVersionFromPomXml(),
                    LOGIN_URL: 'https://access.prepdev.ripe.net/'
                }
            },
            rc: {
                options: {
                    dest: 'src/main/webapp/scripts/app/app.constants.js'
                },
                constants: {
                    ENV: 'rc',
                    SOURCE: 'RIPE',
                    VERSION: parseVersionFromPomXml(),
                    LOGIN_URL: 'https://access.ripe.net/'
                }
            },
            test: {
                options: {
                    dest: 'src/main/webapp/scripts/app/app.constants.js'
                },
                constants: {
                    ENV: 'test',
                    SOURCE: 'TEST',
                    VERSION: parseVersionFromPomXml(),
                    LOGIN_URL: 'https://access.ripe.net/'
                }
            },
            prod: {
                options: {
                    dest: 'src/main/webapp/scripts/app/app.constants.js'
                },
                constants: {
                    ENV: 'prod',
                    SOURCE: 'RIPE',
                    VERSION: parseVersionFromPomXml(),
                    LOGIN_URL: 'https://access.ripe.net/'
                }
            }
        },
        preprocess: {
            options: {
                srcDir: 'src/main/webapp'
            },
            e2e: {
                src: 'src/test/javascript/e2e/_index.html',
                dest: 'src/main/webapp/index.html'
            },
            mocks: {
                src: 'src/test/javascript/e2e/_index-mocks.html',
                dest: 'src/main/webapp/index.html'
            },
            html: {
                src: 'src/main/webapp/_index.html',
                dest: 'src/main/webapp/index.html'
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
                assets: ['**/*.js', '**/*.css']
            },
            taskName: {
                files: [{
                    expand: true,
                    cwd: './src/main/webapp',
                    src: ['index.html'],
                    dest: './dest'
                }]
            }
        },
        connect: {
            options: {
                port: 9000,
                //protocol: 'https',
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: hostname
            },
            livereload: {
                options: {
                    livereload: 35729,
                    open: true,
                    middleware: function (connect, options) {
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }
                        return [
                            //proxyMiddleware,
                            require('grunt-connect-proxy/lib/utils').proxyRequest,
                            serveStatic(appConfig.app)
                        ];
                    }
                },
                proxies: [{
                    host: hostname,
                    context: '/api',
                    port: 8443,
                    https: true,
                    xforward: false,
                    rewrite: {
                        '^/api': '/db-web-ui/api'
                    }
                }, {
                    host: hostname,
                    context: '/db-web-ui/api',
                    port: 8443,
                    https: true,
                    xforward: false
                }]
            },
            e2e: {
                options: {
                    port: 9002,
                    keepalive: false,
                    //open: true,
                    middleware: function (connect, options, middlewares) {
                        return [
                            //require('grunt-connect-proxy/lib/utils').proxyRequest,
                            serveStatic('instrumented'),
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.loadNpmTasks('grunt-protractor-runner');

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.loadNpmTasks('grunt-env');

    grunt.loadNpmTasks('grunt-preprocess');

    grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {

        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'wiredep',
            'preprocess:html',
            'configureProxies:livereload',
            'concurrent:server',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('e2e-test', [
        'env:dev',
        'clean:e2e',
        'wiredep',
        'preprocess:e2e',
        'concurrent:server',
        'connect:e2e',
        'protractor:e2e'
    ]);

    grunt.registerTask('e2e-coverage', [
        'env:dev',
        'clean:e2e',
        'wiredep',
        'preprocess:e2e',
        'instrument',
        'concurrent:server',
        'connect:e2e',
        'protractor_coverage',
        'makeReport'
    ]);

    grunt.registerTask('e2e-no-test', [
        'env:dev',
        'clean:e2e',
        'wiredep',
        'preprocess:mocks',
        'concurrent:server',
        'connect:e2e:keepalive'
    ]);

    grunt.registerTask('default', [
        'env:dev',
        'clean:server',
        'wiredep',
        'preprocess:html',
        'ngconstant:dev',
        'jshint'
    ]);

    grunt.registerTask('test', [
        'env:dev',
        'clean:unittest',
        'wiredep:test',
        'preprocess:html',
        'ngconstant:dev',
        'karma'
    ]);

    grunt.registerTask('build', [
        'env:prod',
        'clean:dist',
        'wiredep:app',
        'preprocess:html',
        'ngconstant:prod',
        'ngtemplates',
        'concurrent:dist',
        'ngAnnotate',
        'compass:server',
        'cacheBust'
    ]);

    grunt.registerTask('build-dev', [
        'env:dev',
        'clean:dist',
        'wiredep:app',
        'preprocess:html',
        'ngconstant:dev',
        'ngtemplates',
        'concurrent:dist',
        'ngAnnotate',
        'compass:server',
        'cacheBust'
    ]);

    grunt.registerTask('build-prepdev', [
        'env:prepdev',
        'clean:dist',
        'wiredep:app',
        'preprocess:html',
        'ngconstant:prepdev',
        'ngtemplates',
        'concurrent:dist',
        'ngAnnotate',
        'compass:server',
        'cacheBust'
    ]);

    grunt.registerTask('build-rc', [
        'env:rc',
        'clean:dist',
        'wiredep:app',
        'preprocess:html',
        'ngconstant:rc',
        'ngtemplates',
        'concurrent:dist',
        'ngAnnotate',
        'compass:server',
        'cacheBust'
    ]);

    grunt.registerTask('build-test', [
        'env:test',
        'clean:dist',
        'wiredep:app',
        'preprocess:html',
        'ngconstant:test',
        'ngtemplates',
        'concurrent:dist',
        'ngAnnotate',
        'compass:server',
        'cacheBust'
    ]);

    grunt.registerTask('build-prod', [
        'env:prod',
        'clean:dist',
        'wiredep:app',
        'preprocess:html',
        'ngconstant:prod',
        'ngtemplates',
        'concurrent:dist',
        'ngAnnotate',
        'compass:server',
        'cacheBust'
    ]);

};
