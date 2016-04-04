// Generated on 2015-05-18 using generator-jhipster 2.11.0
'use strict';
var fs = require('fs');

var parseString = require('xml2js').parseString;
// Returns the second occurence of the version number
var parseVersionFromPomXml = function() {
    var version;
    var pomXml = fs.readFileSync('pom.xml', 'utf8');
    parseString(pomXml, function (err, result){
        version = result.project.version[0];
    });
    return version;
};

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);
    require('time-grunt')(grunt);
    var urlRewrite = require('grunt-connect-rewrite');

    grunt.initConfig({
         protractor: {
            options: {
              configFile: 'src/test/javascript/e2e/conf.js', // Default config file
              noColor: false, // If true, protractor will not use colors in its output.
              args: {}
            },
            e2e: {   // Grunt requires at least one target to run so you can simply put 'all: {}' here too.
              options: {
                  keepAlive: false // If false, the grunt process stops when the test fails.
              }
            },
            continuous: {
                 options: {
                     keepAlive: true
                 }
            }
        },
        yeoman: {
            // configurable paths
            app: require('./bower.json').appPath || 'app',
            dist: 'src/main/webapp/dist'
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
                tasks: ['protractor:continuous']
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
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                'src/main/webapp/scripts/**/*.js'
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
                    htmlmin:  {
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
        env : {
            dev: {
                NODE_ENV:'dev',
                GTM_ID: 'GTM-WTWTB7',
                ACCESS_URL: 'https://access.prepdev.ripe.net?originalUrl=https://dev.db.ripe.net/db-web-ui/'
            },
            prepdev: {
                NODE_ENV:'prepdev',
                GTM_ID: 'GTM-WTWTB7',
                ACCESS_URL: 'https://access.prepdev.ripe.net?originalUrl=https://prepdev.db.ripe.net/db-web-ui/'
            },
            rc: {
                NODE_ENV:'rc',
                GTM_ID:'GTM-T5J6RH',
                ACCESS_URL: 'https://access.ripe.net?originalUrl=https://rc.db.ripe.net/db-web-ui/'
            },
            test: {
                NODE_ENV:'test',
                GTM_ID:'GTM-W4MMHJ',
                ACCESS_URL: 'https://access.ripe.net?originalUrl=https://apps-test.db.ripe.net/db-web-ui/'
            },
            prod: {
                NODE_ENV:'prod',
                GTM_ID:'GTM-TP3SK6',
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
        preprocess : {
            html : {
                src:'src/main/webapp/_index.html',
                dest: 'src/main/webapp/index.html'
            }
        },
        cacheBust: {
            options: {
                baseDir: './src/main/webapp/',
                ignorePatterns: ['index_tmpl.html'],
                encoding: 'utf8',
                algorithm: 'md5',
                length: 16,
                queryString: true,
                assets: ['**/*.js', '**/*.css']
            },
            taskName: {
                files: [{
                    expand: true,
                    cwd: './src/main/webapp/',
                    src: ['index.html']
                }]
            }
        },
        connect: {
            options: {
                protocol:'http',
                hostname: 'localhost',
                port: 9000,
                base:'src/main/webapp'
            },
            test: {
                options: {
                    // set the location of the application files
                    base: ['src/main/webapp']
                }
            }
	    }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.loadNpmTasks('grunt-protractor-runner');

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.loadNpmTasks('grunt-env');

    grunt.loadNpmTasks('grunt-preprocess');

    grunt.registerTask('e2e-test', [
        'connect:test',
        'protractor:continuous',
        'watch:protractor'
    ]);

    grunt.registerTask('e2e-test', [
        'connect:test',
        'protractor:e2e'
    ]);

    grunt.registerTask('default', [
        'env:dev',
        'clean:server',
        'wiredep',
        'preprocess',
        'ngconstant:dev',
        'watch',
        'connect'
    ]);

    grunt.registerTask('test', [
        'env:dev',
        'clean:server',
        'wiredep:test',
        'preprocess',
        'ngconstant:dev',
        'karma',
        'cacheBust'
    ]);

    grunt.registerTask('build', [
        'env:prod',
        'clean:dist',
        'wiredep:app',
        'preprocess',
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
        'preprocess',
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
        'preprocess',
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
        'preprocess',
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
        'preprocess',
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
        'preprocess',
        'ngconstant:prod',
        'ngtemplates',
        'concurrent:dist',
        'ngAnnotate',
        'compass:server',
        'cacheBust'
    ]);

};
