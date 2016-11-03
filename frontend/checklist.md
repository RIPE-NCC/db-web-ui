# Create:
- [ ] Happy path: Select Type -> Create an object -> Check display page
- [ ] Select Type -> Choose type -> in create page hit the back button in browse, do you go back to select type?
- [ ] SSO authentication comes after click on create button from select page
- [ ] Remove yourself from all mntners, 
    - [ ] and try to create an object with a password mntner, do you get the popup?
    - [ ] in the popup hit cancel, is the mntner removed from list?
    - [x] in the popup uncheck associate, complete process, validate
    - [ ] in the 	ete process, validate
    - [ ] or another person’s mntner with only SSO => you get message: ”You cannot modify this object ...”
- [ ] Try removing all mntners, does it hide the form?
- [ ] Assuming you have an SSO mntner, it should be allowed to
    - [ ] add a mntner with only MD5 auth, and remove other mntners, without asking you for the password of the MD5 mntner.
    - [ ] add a mntner with PGP auth, and remove other mntners
- [ ] Make a syntax error on an attribute, do you get feedback on the specific attribute?
- [ ] Cause a business rule error, do you get global error msg?
- [ ] Can you remove mandatory attributes, do you get a nice error?
- [ ] Create a mntner, add an auth line and click on the lock button to add an MD5 password, does it work?
- [ ] Click on the other buttons next to the value, are they working as expected?
- [ ] Click cancel, do you go back to select type?
- [ ] Do you create actually objects in the selected source?
- [ ] Try to create different object types
    - [ ] create new self referenced mntner
    - [ ] create route object 
    - [ ] create pending route object
    
# Modify:
- [ ] Create an object, then click on modify this object, modify and see result.
- [ ] Check that direct modify object link with object as parameter works:
    - [ ] https://rc.db.ripe.net/db-web-ui/#/webupdates/modify/ripe/inetnum/193.0.0.0%20-%20193.0.7.255
- [ ] Login first, search for an object you have the mntner for, click Update, are you in the correct modify screen?
- [ ] While logged out, search for an object you have the mntner for, click log in to update, login, are you in the correct modify screen?
- [ ] Login first, search for an object with a password mntner, click Update, do you get the popup?
- [ ] Login first, search for an object whose mntner in only SSO but not yours, click Update, => you get message: ”You cannot modify this object ...”
- [ ] With your object, click on update, do some modifications to the object, click cancel => get confirm message and go to previous screen. 
- [ ] With your object, click on update, do some modifications to the object, click submit, check the (diff) result
- [ ] Check the update links from the lookup page in the old application

# Delete:
- [ ] Happy path: delete an object with no references
    - [ ] mnt-by = your sso mntner
    - [ ] mnt-by = password mntner
- [ ] delete object with references and check popup:
    - [ ] close popup, are you in modify page?
    - [ ] check popup with a few references
    - [ ] with more than 5 references (does it have the + X more)
    - [ ] click on references, do you go to correct search results in each case?
- [ ] delete object with cyclic references
    - [ ] close popup, are you in modify page?
    - [ ] check the popup, add a custom reason, check that object and references were deleted, check reason in audit log
    
# Display:
- [ ] Check direct display page links with object as parameter shows correctly the object and a message as well (object deleted/created/modified) 
- [ ] https://rc.db.ripe.net/db-web-ui/#/webupdates/display/RIPE/person/TG4989-RIPE?method=Create
- [ ] https://rc.db.ripe.net/db-web-ui/#/webupdates/display/RIPE/person/TG4989-RIPE?method=Modify
- [ ] https://rc.db.ripe.net/db-web-ui/#/webupdates/display/RIPE/person/TG4989-RIPE

# Other:
- [ ] Click on every item in the menu, you should be navigating from the old to the new application and vice versa, make sure the transition is smooth 
- [ ] Check direct links for modify/display
    - [ ] with invalid object types
    - [ ] with invalid source
    - [ ] with non existing object
- [ ] check that old bookmarked links are proxied correctly:
    - [ ] lookup -> display page
    - [ ] query results remains the same
    - [ ] create object page -> new application
    - [ ] update object (obsolete search page) -> query page

