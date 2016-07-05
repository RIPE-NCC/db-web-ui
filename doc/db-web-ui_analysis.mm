<map version="1.0.1">
<!-- To view this file, download free mind mapping software FreeMind from http://freemind.sourceforge.net -->
<node BACKGROUND_COLOR="#ccccff" COLOR="#000066" CREATED="1462532018727" ID="ID_1060823437" LINK="RIPE_NCC.mm" MODIFIED="1464166270615">
<richcontent TYPE="NODE"><html>
  <head>
    
  </head>
  <body>
    <p>
      What's Wrong With db-web-ui
    </p>
  </body>
</html></richcontent>
<edge STYLE="bezier" WIDTH="thin"/>
<font BOLD="true" NAME="SansSerif" SIZE="20"/>
<hook NAME="accessories/plugins/AutomaticLayout.properties"/>
<node COLOR="#660066" CREATED="1463576644540" ID="ID_116536706" MODIFIED="1463744091088" POSITION="right" TEXT="Build System">
<font BOLD="true" NAME="SansSerif" SIZE="18"/>
<node COLOR="#00b439" CREATED="1463577267989" ID="ID_799951913" MODIFIED="1463577269781" TEXT="Issues">
<font NAME="SansSerif" SIZE="16"/>
<node COLOR="#990000" CREATED="1463577247605" ID="ID_1331753844" MODIFIED="1463578628754" TEXT="Too many targets">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      No less than six build targets!
    </p>
    <p>
      DRY principle is ignored -- each target is a copy-and-paste of another.
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1463578535561" ID="ID_1049168962" MODIFIED="1466688646601" TEXT="Cannot test ng-app in isolation">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <ul>
      <li>
        Ng-app should be able to run with mocks or a live back-end
      </li>
      <li>
        Test configs for both web-app and ng-app are in pom.xml, making independent testing difficult and leads to huge configurations: All combinations of tests need to be coded into the pom to support CD pipelining, e.g.

        <ul>
          <li>
            &#160;Production release: Java unit + Java E2E + JS unit + JS E2E
          </li>
          <li>
            &#160;SonarQube Java project: Java unit + Java E2E + no JS
          </li>
          <li>
            &#160;SonarQube JS project: No Java + JS unit + JS E2E
          </li>
          <li>
            and so on...
          </li>
        </ul>
      </li>
      <li>
        Even then you can't use ad hoc Grunt commands -- suppose you want the same set of tests but then with a debug flag?
      </li>
    </ul>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1463578630089" ID="ID_1681080453" MODIFIED="1465392038103" TEXT="Lots of NPM dependencies">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <ul>
      <li>
        Many dependencies duplicate functionality found in other deps
      </li>
      <li>
        Use the 'fixed' notation when specifying version numbers (goes also for bower.json)
      </li>
    </ul>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1463578745270" ID="ID_1438138379" MODIFIED="1465392093428" TEXT="Difficult to do automated tests">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <ul>
      <li>
        Because the app redirects you to a different host to log in -- it's not an Single Page App (SPA) and Protractor only works for SPAs
      </li>
      <li>
        Bug in an underlying Grunt module makes https difficult.
      </li>
    </ul>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
</node>
<node COLOR="#00b439" CREATED="1463577275147" ID="ID_1353955829" MODIFIED="1463577279260" TEXT="Solution">
<font NAME="SansSerif" SIZE="16"/>
<node COLOR="#990000" CREATED="1463577280400" ID="ID_1716068558" MODIFIED="1465820132472" TEXT="Use Yeoman as a project template">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      Yeoman is a project generator which creates a minimal but functional project based on Grunt, Bower and Sass. It includes configurations for a lot of common tasks an Angular developer needs to perform.
    </p>
    <p>
      
    </p>
    <p>
      Grunt - Task automation: build (see below), test runner, server, even release and deploy with the right plugins
    </p>
    <p>
      NPM - Think of it as RPM for a JS project
    </p>
    <p>
      Bower - Dependency management (client app)
    </p>
    <p>
      
    </p>
    <p>
      Grunt can easily be tweaked to do things like:
    </p>
    <ul>
      <li>
        Minification
      </li>
      <li>
        Concatenation
      </li>
      <li>
        Cache busting
      </li>
    </ul>
    <p>
      It does this by leveraging the features of a small number of modules and re-useable configuration items.
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1463578480814" ID="ID_1305385878" MODIFIED="1466688844052" TEXT="Split ng-app from web-app">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <ul>
      <li>
        Can use Grunt to do the builds instead of Maven &gt; Yeoman plugin &gt; Grunt.
      </li>
      <li>
        Server-side properties can be fetched and used in ng-app initialization either by issuing a service call or by 'compiling' the values into the app (a bit like it does now for some of the constants)
      </li>
      <li>
        See 'Testing: Solution' for more details on improving automated tests
      </li>
    </ul>
  </body>
</html>
</richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1464084001528" ID="ID_463966275" MODIFIED="1465391997364" TEXT="Fix JS module versions">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      i.e. use 'x.x.x' and not '^x.x.x' or '~x.x.x'
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
</node>
</node>
<node COLOR="#660066" CREATED="1463578872828" ID="ID_21550069" MODIFIED="1463578894659" POSITION="right" TEXT="Code analysis">
<font BOLD="true" NAME="SansSerif" SIZE="18"/>
<node COLOR="#00b439" CREATED="1463578895162" ID="ID_99072938" MODIFIED="1463578903505" TEXT="Issues">
<font NAME="SansSerif" SIZE="16"/>
<node COLOR="#990000" CREATED="1463578903506" ID="ID_902657629" MODIFIED="1465561112849" TEXT="Constants are defined in different ways">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <ul>
      <li>
        Some are using the ng-constant library,
      </li>
      <li>
        Some are defined in the code.
      </li>
      <li>
        Many constants/enums are not defined, e.g. object types, attribute names, lists (mntners, &amp;c.)
      </li>
    </ul>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1463578918432" ID="ID_454147104" MODIFIED="1465393976742" TEXT="HTML tag ids are not unique!">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <ul>
      <li>
        Bad practice
      </li>
      <li>
        Could introduce bugs if our code relies on them
      </li>
      <li>
        If the code doesn't rely on them they shouldn't be there
      </li>
    </ul>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1465397085063" ID="ID_1867741966" MODIFIED="1465397117211" TEXT="Inline CSS is used">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      Classes should be used instead -- they render quicker
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1463742797996" ID="ID_499214162" MODIFIED="1465560527044" TEXT="Excessive use of $scope">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <ul>
      <li>
        Some things defined in the $scope should be&#160;constants
      </li>
      <li>
        Scope vars should be objects, not primitives (e.g. $scope.data.id)
      </li>
      <li>
        Many controller functions have external dependency on $scope vars making them very fragile (should be writing to scope, not reading)
      </li>
    </ul>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1463578944718" ID="ID_959462698" MODIFIED="1465397128937" TEXT="Circular dependencies in modules">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      Doesn't appear to have a direct negative consequence but it just doesn't make sense to introduce such a dependency anyway.
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1464360407334" ID="ID_1345093229" MODIFIED="1465393888874" TEXT="Unnecessarily complex objects and call graphs">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <ul>
      <li>
        E.g. extra level in RpslObject objects.object[], attributes.attribute[],
      </li>
      <li>
        functions which just delegate to another function which is implemented in one line
      </li>
      <li>
        The list of attributes which also has methods!
      </li>
    </ul>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1465819281088" ID="ID_1481484091" MODIFIED="1465819879598" TEXT="JSHint, IIFE, &apos;use strict&apos;, /*global ...*/ and other mysteries">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      Not being used in our code but these things should be used in every JS file
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
</node>
<node COLOR="#00b439" CREATED="1463578959420" ID="ID_1551320846" MODIFIED="1463578962115" TEXT="Solution">
<font NAME="SansSerif" SIZE="16"/>
<node COLOR="#990000" CREATED="1463578962700" ID="ID_798681049" MODIFIED="1464084281058" TEXT="Use JS lint tool">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      JS lint report is being generated on SonarQube
    </p>
    <p>
      JS lint metrics should be used in the decision to release to production
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1463579541866" ID="ID_87824046" MODIFIED="1466081387932" TEXT="Read Angular Best Practices">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <ul>
      <li>
        Must read: <a href="https://github.com/johnpapa/angular-styleguide/tree/master/a1">https://github.com/johnpapa/angular-styleguide/tree/master/a1 </a>
      </li>
      <li>
        This chap knows a thing or two about Angular: <a href="http://www.bennadel.com">Ben Nadel www.bennadel.com</a>
      </li>
      <li>
        Use the Mozilla Developer Network (MDN) for JS specs &#8212; NOT W3Schools
      </li>
      <li>
        https://www.airpair.com/angularjs/posts/top-10-mistakes-angularjs-developers-make
      </li>
    </ul>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1464360628592" ID="ID_109801811" MODIFIED="1464360792943" TEXT="Factor the complexity out">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      ...but only when we have enough test coverage to be sure
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
</node>
</node>
<node COLOR="#660066" CREATED="1463671323833" ID="ID_1557542891" MODIFIED="1464359497200" POSITION="right" TEXT="Testing">
<font BOLD="true" NAME="SansSerif" SIZE="18"/>
<node COLOR="#00b439" CREATED="1463671332966" ID="ID_404840661" MODIFIED="1463671334745" TEXT="Issues">
<font NAME="SansSerif" SIZE="16"/>
<node COLOR="#990000" CREATED="1464173590284" ID="ID_10344159" MODIFIED="1464173697760" TEXT="No alignment of business requirements vs tests">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      Meaning there's no direct link from a business requirement that can be stated (e.g. in a policy document) to a place in the code where we can demonstrate that the requirement is being tested.
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1463739078449" ID="ID_809098155" MODIFIED="1464166330145" TEXT="No quality controls (gate)">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      No defined minimum coverage level for releases
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1463742910994" ID="ID_1893111999" MODIFIED="1465393520490" TEXT="Unit test coverage is OK but not good">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      There SHOULD be no need to improve unit test coverage since all front-end code should be covered be integration tests.
    </p>
    <p>
      However, since the app is also doing business logic then this needs testing as well.
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1463739131869" ID="ID_1718880448" MODIFIED="1464184024443" TEXT="Not enough E2E coverage">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <table>
      <tr>
        <td valign="top">
          Integration&#160;Tests
        </td>
        <td valign="top">
          33.5%
        </td>
      </tr>
      <tr>
        <td valign="top">
          Lines
        </td>
        <td valign="top">
          36.5%
        </td>
      </tr>
      <tr>
        <td valign="top">
          Conditions
        </td>
        <td valign="top">
          23.0%
        </td>
      </tr>
    </table>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1463743587272" ID="ID_1941853807" MODIFIED="1464173615014" TEXT="Mocks do not reflect real data">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      Mocks can become obsolete when the code changes. This is a generic problem, not one especially for db-web-ui
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
</node>
<node COLOR="#00b439" CREATED="1463671336328" ID="ID_963658872" MODIFIED="1464084846721" TEXT="Solution">
<font NAME="SansSerif" SIZE="16"/>
<node COLOR="#990000" CREATED="1463739160106" ID="ID_1326216993" MODIFIED="1465393492200" TEXT="Improve code coverage">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      Focus on E2E tests since these are more robust:
    </p>
    <ul>
      <li>
        Functionality tested by E2E tests is less likely to change than an implementation covered by a unit test
      </li>
      <li>
        Unit tests break when code is refactored. E2E tests check that the app still works after refactoring.
      </li>
    </ul>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1463739176417" ID="ID_1858679827" MODIFIED="1464176518604" TEXT="Define minimum coverage thresholds for production releases">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      Should be &gt; 95% IMO. Cannot be confident about making changes with any less.
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1463742965213" ID="ID_1238092591" MODIFIED="1465392225973" TEXT="Define scenarios">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      Identify every business rule and interface response
    </p>
    <p>
      Write user stories which exercise the rules and describe the UI interactions
    </p>
    <p>
      Use the stories to define or extract mock data both at the ng-app/web-app interface and the web-app/data-app i/f
    </p>
    <p>
      
    </p>
    <p>
      Example: https://docs.google.com/spreadsheets/d/1zaHfAUXIChojm-dUiZuezkhahmwWIFbDbqFpwURIqPg/edit#gid=0
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1464084846722" ID="ID_1408911295" MODIFIED="1464173443895" TEXT="Automatically capture and re-use mocks">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      This becomes possible when `grunt serve` works. A Grunt module, Prism, can be used to capture the traffic between the ng-app and the web-app. The approach is this:
    </p>
    <ul>
      <li>
        Start `grunt serve` with Prism in 'record' mode and with a real back-end service
      </li>
      <li>
        Click through a scenario. Prism stores the requests and responses as files on the disk.
      </li>
      <li>
        Stop the Grunt server and shut down the back end.
      </li>
      <li>
        Start `grunt serve` with Prism in 'playback' mode.
      </li>
      <li>
        You can now click through the same scenario&#160;you recorded earlier, or any subset of any scenario you've recorded.
      </li>
    </ul>
    <p>
      An advantage of having the requests and responses recorded as files on disk is that they can be used for feeding Protractor tests with mocks, so the scenario that you recorded manually can easily be used to provide the mocks for an automated test. The same mocks can also be used to test the web-app, for example by firing a request and checking that the response matches the one recorded in the Prism files.
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
</node>
</node>
<node COLOR="#660066" CREATED="1463743291970" ID="ID_1613363617" MODIFIED="1464360009408" POSITION="right" TEXT="UX">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      Not an immediate problem but worth going though the points so that we don't make UX issues harder to solve in the future.
    </p>
  </body>
</html></richcontent>
<font BOLD="true" NAME="SansSerif" SIZE="18"/>
<node COLOR="#00b439" CREATED="1463743295665" ID="ID_1817011977" MODIFIED="1464184165589" TEXT="Issues">
<font NAME="SansSerif" SIZE="16"/>
<node COLOR="#990000" CREATED="1463743300128" ID="ID_1853977808" MODIFIED="1464172299722" TEXT="Not mobile first">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      Isn't an issue now but it might be if/when we want to support mobile. There are conflicting opinions about whether this is, or will ever be, an issue.
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1464086597505" ID="ID_34724252" MODIFIED="1464173259755" TEXT="Issues when resizing screen">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      The menu hides part of the screen when the client window is between 996 and 1000px wide.
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1464184166828" ID="ID_1521695888" MODIFIED="1464359465609" TEXT="No a11y support">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      Again, probably unlikely to ever be an explicit requirement -- nevertheless, support for a11y is an 'unwritten' requirement for all public web pages since they can be viewed by anybody. Users who need a11y features who found their way to the DB pages by mistake still need to be able to read the page and understand what it is.
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
</node>
<node COLOR="#00b439" CREATED="1463743361811" ID="ID_1087294991" MODIFIED="1463743364570" TEXT="Solution">
<font NAME="SansSerif" SIZE="16"/>
<node COLOR="#990000" CREATED="1463743365018" ID="ID_1732020669" MODIFIED="1464173099651" TEXT="Follow the Bootstrap guide">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      We're not making the most of the Bootstrap classes, instead we're using several custom classes and inline css (&lt;tag style=&quot;xxx: yyy;&quot;&gt;...&lt;/tag&gt; )
    </p>
    <p>
      These are interfering with what the Bootstrap&#160;&#160;CSS is trying to do.
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1464172335302" ID="ID_806372585" MODIFIED="1464179310629" TEXT="Limit the number of different UI libs">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      Because it's easier to get a single set of widgets working together than combining widgets from several 3rd parties.
    </p>
    <p>
      See UI Bootstrap, for an example of a complete widget library: http://angular-ui.github.io/bootstrap/
    </p>
    <p>
      
    </p>
    <pre>$ bower install angular-bootstrap
    </pre>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
<node COLOR="#990000" CREATED="1463743508207" ID="ID_1611228170" MODIFIED="1464173213945" TEXT="Need UX input to help resolve interface issues">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <p>
      There are lots of things to consider if we go down this route: http://www.uxbooth.com/articles/designing-mobile-part-3-visual-design/
    </p>
    <p>
      Use the new design when rebuilding the Java Faces code with ng-app/web-app?
    </p>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="14"/>
</node>
</node>
</node>
<node COLOR="#660066" CREATED="1465392252047" ID="ID_818642935" MODIFIED="1465396125857" POSITION="right" TEXT="Road map">
<font BOLD="true" NAME="SansSerif" SIZE="18"/>
<node COLOR="#00b439" CREATED="1465392533651" ID="ID_143501305" MODIFIED="1465463338667" TEXT="TODO">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <ul>
      <li>
        DEV mode in the back-end supports automatic user auth (can test as SPA)
      </li>
      <li>
        Common configuration for Grunt which does E2E coverage reports on db-tools-1&#160;I

        <ul>
          <li>
            &#160;Should work for 'standard' project layouts
          </li>
          <li>
            IE, FF, Chrome and PhantomJS supported
          </li>
        </ul>
      </li>
      <li>
        Split static files from server code so we have two apps (optional)
      </li>
      <li>
        Write scenarios
      </li>
      <li>
        Harvest mocks (preferably using Grunt/Prism)
      </li>
      <li>
        Implement scenarios as E2E tests
      </li>
    </ul>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="16"/>
</node>
<node COLOR="#00b439" CREATED="1465392568449" ID="ID_1942875080" MODIFIED="1465399095447" TEXT="Future?">
<richcontent TYPE="NOTE"><html>
  <head>
    
  </head>
  <body>
    <ul>
      <li>
        Presentation tier in web-app to reduce front-end footprint and improve client performance
      </li>
      <li>
        Quality gate based on E2E coverage and JSHint report (or equivalent)
      </li>
      <li>
        Drive web-app testing with the same mocks used by ng-app
      </li>
      <li>
        Run E2E tests for IE, FF, Chrome on Windoze
      </li>
    </ul>
  </body>
</html></richcontent>
<font NAME="SansSerif" SIZE="16"/>
</node>
</node>
</node>
</map>
