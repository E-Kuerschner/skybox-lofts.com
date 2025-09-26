# Phase One
This document defines the features scoped for the initial release of the site.
For general requirements/documentation, see `docs/REQUIREMENTS.md`.

## Key Features
1. **Landing page** with building information and contact details
2. **Password-protected resident section**
3. **Document repository** organized by type
4. **Board member information**
5. **Contact forms** for resident communication

## Global Navigation Menu
At all times, the following nav links will be available
- **Home** (to "/")
- **Resident Info** (to "/resident")

## Home Page (path: "/")
### Content
Below is all the text content that should be found on the public home page:
- **Site Title**: "Sky Box Lofts"
- **Main Heading**: "Welcome to Sky Box Lofts"
- **Description**: "Welcome to the Sky Box Loft Condominium Association website. Here you will find news, minutes of the board meetings, forums to discuss various issues in the building, and much more. This website is private and registration is limited to residents and owners of Sky Box Lofts."
- **Password Notice**: "In order to access the non-public portion of this site you must have a login and password."
- **Building Address**:
    - 920 W. Sheridan Rd
    - Chicago, IL 60613

### Embedded Google Maps
The home page also features an embedded Google Maps with the address pinned.

## Resident Info (path: "/resident")
### Navigation
Residents will have access to a couple of additional pages on the site:
- **Documents** (to "/resident/docs")
- **Board Members** (to "/resident/board")

### Auth Strategy
All `/resident` pages are protected by auth.
Use a global site password to authenticate a user. The password can be set via environment variable.
A when a user has submitted the correct password, a new session can be created. A session should last one week and can be stored in a cookie.

If possible, Better Auth should be used to create the session to make it easier to migrate to Phase 2 where Better Auth will definitely be required.

#### Auth Flow (User attempts to access a protected page)
- Active session?
  - Let the pass
- No session?
  - redirect them to "/login"

### Content
- **Announcements** section (appears to be for announcements)
- **Contact Form** with fields:
    - Name
    - Email
    - Subject
    - Message
    - reCAPTCHA verification
    - Submit button

## Resident Documents Page (path: "/resident/docs")
### Content
This page contains links to:
- **Sky Box Meeting Notes** (leads to meeting notes archive)
- **Budgets** (leads to budget archive)
- **Sky Box By-laws** (downloadable ZIP file)
- **Sky Box Condo Association Declaration** (downloadable ZIP file)
- **Sky Box Rules and Regulations** (downloadable PDF)

## Meeting Notes (path: "/resident/docs/meetings-notes")
Lists all meeting notes files found in the Documents bucket and displays them in alphabetical order.
Clicking a file will download it from the user's browser.

## Budget Archive (path: "/resident/docs/budget)
Lists all the budget files found in the Documents bucket and displays them in alphabetical order.
Clicking a file will download it from the user's browser.

## Board Members Section (path: "resident/board")
### Content
- **Current Board Members** 
    - Michael Kmak - Board President
    - Nancy Kingsland - Board Treasury
    - Richard Straub - Board Secretary
- **Contact Form** (same as in resident home page)