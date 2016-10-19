
README for db-web-ui
====================

Pre-requisites
-----------------
npm
grunt
bower
compass (ruby)

Build on Local Machine
-----------------------

    % mvn verify

Start Full Development Server (Frontend + Backend) on Local Machine
-------------------------------------------------------------------

* first build (see above)

* execute: ```% mvn jetty:run -Dspring.profiles.active=dev```
     
* map ```127.0.0.1``` to ```localhost.ripe.net``` in your local hosts file

* access the app at: https://localhost.ripe.net:8443/db-web-ui/


Deployment
-------------------
To create a war use:

    % mvn package

Runtime
-------------------
Add the "-Dspring.profiles.active=<ENV>" to the JVM args of the application server.

Valid profile names are dev, prepdev, rc and prod.

Properties are read from the /config/application-<ENV>.properties file on the classpath.


Setup Grunt
-----------
* CD to {projectRoot}/frontend

* Run ```npm install``` 

* Run ```bower install```

Use Grunt
---------
* \<no args\><br>
  Does a JSHint report for on all the JS files in the app
* serve<br>
  Starts a server on port 9080 which connects to a live backend. NOTE: doesn't work yet because Grunt can't
  negotiate with the https server -- partly due to a bug in a bug in a grunt dependency
* test<br>
  alias for ```unit-test```
* watch:dist<br>
  Use this along with ```mvn spring-boot:run```. It watches the JS and HTML files for changes and redeploys them
  when they've changed. In detail: the watch task is triggered by changes in the file system. Depending on the
  change it detects, watch will run the appropriate Grunt task and put the result in the ```webapp``` directory
  just like ```grunt build``` would.
* e2e-test<br>
  Runs the Protractor tests on port 9002. These are the same tests as the e2e-coverage target but they run without
  coverage so they are quicker.
* e2e-no-test<br>
  Starts a server with the same configuration as the E2E tests, except the tests are not run. Use this configuration
  when you want to see the page as Protractor sees them - useful for fault finding and setting up mocks
* e2e-coverage<br>
  Runs the Protractor tests and shows coverage stats in two ways:
  - a text summary in the console
  - a detailed html report at ```./reports/e2e-coverage/lcov-report/index.html```
  - N.B. this task is designed to run on db-tools-1 only -- it won't work locally unless you change the line
   containing the reference to db-tools-1 in protractor-e2e-coverage.conf.js
  - [see the coverage results on SonarQube](http://db-tools-1:8088/view/db-web-ui/job/db-web-ui-coverage-ng/11/console)

Testing
-------------------
Login to the DEV or PREPDEV environments using the SSO username db-staff@ripe.net / password dbstaffsso.


IntelliJ Preferences
--------------------
* Editor
	* File Types
		* Ignore Files and Folders
			* Add: node_modules
* Project Structure
        * Project Settings
                * Project
                        * Project SDK: 1.8
                        * Language level: 1.8

Architecture
------------

Rules of thumb:

* All rest calls from angular ui go via java-proxy. Java proxy transparently forwards to backends.
* In the new angular CRUD-ui (searching, creating, modifying and deleting whois objects) we stick to the "whoisresources-objects-object"-protocol.
    So when searching for maintainers of sso-user, we return a regular search result. What todo with the star?
    For the service that delivers info for the upper-right-sso-info, we use a dedicated protocol.
* When designing new urls for the java-proxy, stick to the whois conventions
* UI should be as simple as possibly: So fetching or pushing information should be done with a single call. The java proxy can aggregate to achieve this.
* Always try to solve problem in backend. if not possible in java-proxy, as last resort in angular UI. We could promote functions from java-proxy to backend over time, so others can also profit.
* All services a provided by the java-proxy shall be protected by sso. If not logged in, a 403 shall be returned. The angular UI shall redirect to access.ripe.net on a REST 403

Responsibilities of java-proxy: Non functionals only

* Security
* Aggregation
* Same origin
* Api-key to backends
* Caching
* Flexibilty: fix whois problems temporarily


Things every db-web-ui developer should know
--------------------------------------------

* Must read: https://github.com/johnpapa/angular-styleguide/tree/master/a1
* This chap knows a thing or two about Angular: Ben Nadel www.bennadel.com
* Use the Mozilla Developer Network (MDN) for JS specs — NOT W3Schools
* https://www.airpair.com/angularjs/posts/top-10-mistakes-angularjs-developers-make


HOWTOs
------

### Update the Ripe global web site template

Download the [latest template from here]
(https://www.ripe.net/manage-ips-and-asns/db/webupdates/@@template?versions=true&show_left_column=true&database_includes=true)

It's always a good idea to format the file in a consistent way so it's easier to see the changes with the previous
version. The best tool for this is `js-beautify` -- you can install it with:

    npm install -g js-beautify

##### Example: download, format and diff the latest version of the template

Open a terminal and cd into the `src/main/webapp` directory, then type these commands:

    curl "https://www.ripe.net/manage-ips-and-asns/db/webupdates/@@template?versions=true&show_left_column=true&database_includes=true" |js-beautify --type html |sed -e "/^\s*$/d" > template.html
    diff _index.html template.html

Protractor
----------

Tip: If you want run just one test then write ```fit``` (for 'focus it') instead of ```it```: i.e. ```fit(```*description*, *function*```);```


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

