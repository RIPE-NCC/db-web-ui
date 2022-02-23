
README for db-web-ui
====================

Links
-----
* [Bamboo 🔗](https://bamboo.ripe.net/browse/DB-DBHWEB)
* [BitBucket 🔗](https://bitbucket.ripe.net/projects/SWE/repos/db-web-ui/browse)
* [Environments (Marvin) 🔗](https://marvin.ripe.net/display/db/DB+Environments)
* [Sonar 🔗](http://db-tools-1:9000/dashboard/index/15937)
* [Kibana 🔗](http://db-tools-1:8000/)
* [Jenkins (deprecated) 🔗](http://db-tools-1:8088/view/db-web-ui/)

Pre-requisites
-----------------
* maven (v3.0+)
* npm

Build on Local Machine
-----------------------

    mvn clean install

Start Full Development Server (Frontend + Backend) on Local Machine
-------------------------------------------------------------------
> Every small change to be visible in browser you have to run `mvn clean install` otherwise change wont be visible in browser 

* first build (see above)

* map `127.0.0.1` to `localhost.ripe.net` in your local hosts file

* cd into the `backend` sub folder

* execute (using the Spring Boot Maven Plugin) execute: ```mvn spring-boot:run -Dspring-boot.run.profiles=local -Dspring.profiles.active=local -Dspring-boot.run.jvmArguments="-Duser.timezone=UTC"```     

* or Right click on ```/backend/src/main/java/net/ripe/whois/Application.java run in intellij, make sure to add -Dspring.profiles.active=local```

* access the app at: https://localhost.ripe.net:8443/db-web-ui/

Runtime
-------------------
Add the "-Dspring.profiles.active=<ENV>" to the JVM args of the application server.

Valid profile names are dev, prepdev, rc and prod.

Properties are read from the /config/application-`<ENV>`.properties file on the classpath.

To run locally add in the vm options: `-Dspring.profiles.active=local -Duser.timezone=UTC`

Frontend
--------
> Open a terminal and cd into the `frontend`

### Build

* `npm run build-dev`<br>
  webpack build Just-in-Time (JIT), used for local development. This build will include source-map - TypeScript code in browser for debugging.
   
* `npm run build`<br>
  webpack build Ahead-of-Time (AOT), which compiles app at build time, used for deployments.
  
* `npm run start`<br>
  Use this along with ```mvn spring-boot:run```. It watches the TypeScript and HTML files for changes and redeploys them
  when they've changed. In detail: the watch task is triggered by changes in the file system. Access application on https://localhost.ripe.net:4200/db-web-ui/ (port changes after logging, so pay attention to return it to 4200)

### Test

* `npm run test`<br>
  Running Karma unit tests locally for Angular 6+ with coverage
  - [Angular Unit test coverage 🔗](frontend/reports/unittest-coverage/index.html) is available locally
   
* `npm run test-remote` _(used on bamboo)_<br>
  Running Karma unit tests remotely in selenium chrome on `193.0.2.222:4444/wd/hub` for Angular 6+ with coverage
  
* `npm run e2e-chrome`<br>
  Runs the Protractor tests on port 9002 in Chrome without coverage so they are quicker.

* `npm run e2e-firefox`<br>
  Runs the Protractor tests on port 9002 in FireFox without coverage so they are quicker.
  
* `npm run e2e-remote` _(used on bamboo)_<br>
  Runs the Protractor tests in selenium. 
  _End where e2e test runned on bamboo can be seen in screenshots http://193.0.2.222:4444/wd/hub/static/resource/hub.html_
   
* `npm run start-mock`<br>
  Starts a server with the same configuration as the E2E tests, except the tests are not run. Use this configuration
  when you want to see the page as Protractor sees them - useful for fault finding and setting up mocks. <br />
  _To be able to run e2e-no-test locally (http://localhost:9002/db-web-ui) with logged in user you will have to check <br />
  `hostname -s` and then resulted host name (for example laptop-123456.local) add<br /> 
  `127.0.0.1       laptop-123456.local` in you host file<br />
  `sudo vi /etc/hosts`_  

### Linting
* `npm run lint`<br>
  Lint rules can be found under `frontend/.eslintrc.json`

#### TODO
  Runs the Protractor tests and shows coverage stats in two ways:
  - a text summary in the console
  - [a detailed html report 🔗](frontend/reports/e2e-coverage/lcov-report/index.html)
  - N.B. this task is designed to run on db-tools-1 only -- it won't work locally unless you change the line
   containing the reference to db-tools-1 in protractor-e2e-coverage.conf.js
  - [see the coverage results on SonarQube 🔗](http://db-tools-1.ripe.net:9000/dashboard/index/net.ripe.db:db-web-ui-ng)
 
Testing
-------------------
Login to the DEV or PREPDEV environments using the SSO username db-staff@ripe.net / password dbstaffsso.

IntelliJ Preferences
--------------------
* Editor
	* File Types
		* Ignore Files and Folders
			* node_modules
			* dist
	* Code Style
		* Use single class import (do not allow .* asterisk imports)

* Project Structure
        * Project Settings
                * Project
                        * Project SDK: 1.8
                        * Language level: 1.8
* Languages & Frameworks
    * TypeScript
        * Use TypeScript Service
        * Code Quality Tools
        		* TSLint: Enable

Architecture
------------

Rules of thumb:

* All rest calls from angular ui go via java-proxy. Java proxy transparently forwards to backends.
* In the new angular CRUD-ui (searching, creating, modifying and deleting whois objects) we stick to the "whoisresources-objects-object"-protocol.
    So when searching for maintainers of sso-user, we return a regular search result. What todo with the star?
    For the service that delivers info for the upper-right-sso-info, we use a dedicated protocol.
* When designing new urls for the java-proxy, stick to the whois conventions
* UI should be as simple as possible: So fetching or pushing information should be done with a single call. The java proxy can aggregate to achieve this.
* Always try to solve problem in backend. if not possible in java-proxy, as last resort in angular UI. We could promote functions from java-proxy to backend over time, so others can also profit.
* All services a provided by the java-proxy shall be protected by sso. If not logged in, a 403 shall be returned. The angular UI shall redirect to access.ripe.net on a REST 403

Responsibilities of java-proxy: Non-functionals only

* Security
* Aggregation
* Same origin
* Api-key to backends
* Caching
* Flexibilty: fix whois problems temporarily


Things every db-web-ui developer should know
--------------------------------------------

* Must read: https://blog.angularindepth.com/the-best-way-to-unsubscribe-rxjs-observable-in-the-angular-applications-d8f9aa42f6a0
* Style guide: https://angular.io/guide/styleguide
* Native Angular component used in this project: https://ng-bootstrap.github.io/#/getting-started
* RxJS operators with clear explanations and executable examples: https://www.learnrxjs.io/ 
* Use the Mozilla Developer Network (MDN) for JS specs — NOT W3Schools


HOWTOs
------

### Update the Ripe global web site template

Download the [latest template from here 🔗](https://www.ripe.net/manage-ips-and-asns/db/webupdates/@@template?versions=true&show_left_column=true&database_includes=true)

It's always a good idea to format the file in a consistent way so it's easier to see the changes with the previous
version. The best tool for this is `js-beautify` -- you can install it with:

    npm install -g js-beautify

##### Example: download, format and diff the latest version of the template

Open a terminal and cd into the `frontend/app` directory, then type these commands:

    curl "https://www.ripe.net/manage-ips-and-asns/db/webupdates/@@template?versions=true&show_left_column=true&database_includes=true" |js-beautify --type html |sed -e "/^\s*$/d" > template.html

### Ripe web components 
Join technical design bot channel on Mattermost to stay up to date with releases and change version in package.json file
https://gitlab.ripe.net/technical-design/ripe-app-webcomponents

### Update angular
Use https://update.angular.io

Protractor
----------

Tip: If you want run just one test then write `fit` (for 'focus it') instead of `it`: i.e. `fit(*description*, *function*);`


##### Notes on matchers

``` javascript
expect(fn).toThrow(e);
expect(instance).toBe(instance);
expect(mixed).toBeDefined();
expect(mixed).toBeFalsy();
expect(number).toBeGreaterThan(number);
expect(number).toBeLessThan(number);
expect(mixed).toBeNull();
expect(mixed).toBeTruthy();
expect(mixed).toBeUndefined();
expect(array).toContain(member);
expect(string).toContain(substring);
expect(mixed).toEqual(mixed);
expect(mixed).toMatch(pattern);
```

Sitespeed
----------

Sitespeed.io is a set of Open Source tools that makes it easy to monitor and measure the performance of your web site. 
Use sitespeed Docker container to get an environment with Firefox, Chrome, XVFB and sitespeed.io up

` docker run --shm-size=1g --rm -v "$(pwd)":/sitespeed.io sitespeedio/sitespeed.io:7.7.3 https://prepdev.db.ripe.net/db-web-ui/ `

Matomo (ex. Piwik)
------------------

https://matomo.ripe.net/  

Debug tool <br />
https://apps.db.ripe.net/db-web-ui/?mtmPreviewMode=BuGxbMDR#/webupdates/select

Running E2E tests in Gitlab
---------------------------

E2E (Protractor) tests are run in-container in Gitlab for every commit.
The whois-build image contains both a Chrome and Firefox browser that is used to run the E2E tests.

The webdriver version for Chrome has been pinned in the [js package build config](frontend/package.json) so it corresponds with the Chrome version
being used. If the webdriver and Chrome version mismatch running the tests will fail with a message similar to this:

````
[09:32:37] E/launcher - session not created: This version of ChromeDriver only supports Chrome version 83
  (Driver info: chromedriver=83.0.4103.39 (ccbf011cb2d2b19b506d844400483861342c20cd-refs/branch-heads/4103@{#416}),platform=Linux 4.19.76-linuxkit x86_64)
[09:32:37] E/launcher - SessionNotCreatedError: session not created: This version of ChromeDriver only supports Chrome version 83
  (Driver info: chromedriver=83.0.4103.39 (ccbf011cb2d2b19b506d844400483861342c20cd-refs/branch-heads/4103@{#416}),platform=Linux 4.19.76-linuxkit x86_64)
    at Object.checkLegacyResponse (/db-web-ui/frontend/node_modules/selenium-webdriver/lib/error.js:546:15)
    at parseHttpResponse (/db-web-ui/frontend/node_modules/selenium-webdriver/lib/http.js:509:13)
    at doSend.then.response (/db-web-ui/frontend/node_modules/selenium-webdriver/lib/http.js:441:30)
````
