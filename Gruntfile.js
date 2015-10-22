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
        yeoman: {
            // configurable paths
            app: require('./bower.json').appPath || 'app',
            dist: 'src/main/webapp/dist'
        },
        watch: {
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
                'src/main/webapp/scripts/app.js',
                'src/main/webapp/scripts/app/**/*.js',
                'src/main/webapp/scripts/components/**/*.js'
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
                src: ['scripts/app/**/*.html', 'scripts/components/**/*.html',],
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
            },
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
                src : 'src/main/webapp/index_tmpl.html',
                dest : 'src/main/webapp/index.html'
            }
        },
        connect: {
	      server: {
	        options: {
	          port: 9001,
	          base: 'build',
	          middleware: function(connect, options) {
	            // Return array of whatever middlewares you want
	            return [
	              // redirect all urls to index.html in build folder
	              urlRewrite('build', 'index.html'),

	              // Serve static files.
	              connect.static(options.base),

	              // Make empty directories browsable.
	              connect.directory(options.base)
	            ];
	          }
	        }
	      }
	    }
    });

    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.loadNpmTasks('grunt-env');

    grunt.loadNpmTasks('grunt-preprocess');

    grunt.registerTask('default', [
        'clean:server',
        'wiredep',
        'preprocess',
        'ngconstant:dev',
        'watch',
        'connect'
    ]);

    grunt.registerTask('test', [
        'clean:server',
        'wiredep:test',
        'preprocess',
        'ngconstant:dev',
        'karma'
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
        'compass:server'
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
        'compass:server'
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
        'compass:server'
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
        'compass:server'
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
        'compass:server'
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
        'compass:server'
    ]);

};
