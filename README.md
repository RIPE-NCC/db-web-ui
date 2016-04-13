README for whois_webui
==========================

Pre-requisites
-----------------
npm
grunt
bower


Development Server
------------------

The normal maven build process should complete without errors:

    % mvn verify

The server can be started from the command-line:

    % mvn spring-boot:run

Deployment
-------------------
To deploy to any environment (dev/prepdev/rc/prod), create a war using:

    % mvn -Pdeploy package -Dspring.profiles.active=<ENV> 

e.g. to deploy to RC: 

    % mvn -Pdeploy package -Dspring.profiles.active=rc
      
    
this will create a war for the specific environment by calling 
the appropriate grunt task for that environment. The grunt task will
generate the appropriate scripts/app/app.constants.js file.

Also add the "-Dspring.profiles.active=<ENV>" to the JVM args of the application server.

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

Chores
------

### Updating the web site template

Download the [latest template from here]
(https://www.ripe.net/manage-ips-and-asns/db/webupdates/@@template?versions=true&show_left_column=true&database_includes=true)

It's always a good idea to format the file so it's easier to see the changes with the previous version, assuming that it
 was also formatted the same way. The best tool for this is `js-beautify` -- you can install it with:

    npm install -g js-beautify

Example usage: Open a terminal and cd into the `src/main/webapp` directory, then type these commands:
 
    curl "https://www.ripe.net/manage-ips-and-asns/db/webupdates/@@template?versions=true&show_left_column=true&database_includes=true" > template.html
    js-beautify --type html -r -f template.html
    diff _index.html template.html
 

