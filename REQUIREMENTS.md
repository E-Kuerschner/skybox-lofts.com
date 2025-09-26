# Sky Box Lofts Website Requirements Document

## Overview
This document captures the content and structure requirements for the new Sky Box Lofts HOA website based on exploration of the existing site at https://skyboxlofts.info.

## Site Structure and Navigation

### Public Area (No Password Required)
#### Main Navigation
- **Home**
- **Resident Info** (password protected)

#### Home Page Content
- **Site Title**: "Sky Box Lofts"
- **Main Heading**: "Welcome to Sky Box Lofts"
- **Description**: "Welcome to the Sky Box Loft Condominium Association web/esite. Here you will find news, minutes of the board meetings, forums to discuss various issues in the building, and much more. This website is private and registration is limited to residents and owners of Sky Box Lofts."
- **Password Notice**: "In order to access the non-public portion of this site you must have a login and password."
- **Building Address**:
    - 920 W. Sheridan Rd
    - Chicago, IL 60613
- **Contact Information**:
    - Email: skyboxlofts@gmail.com
    - Website: www.skyboxlofts.info

#### Header Downloads (Available on All Pages)
- Three downloadable PDF documents:
    - SBL Meeting Minutes 31MAY18.pdf
    - SBL Meeting Minutes 11SEP18.pdf
    - SBL Meeting Minutes 31MAY18.pdf (duplicate)

### Protected Area (Password Required: "Skybox1")

#### Resident Info Landing Page
- **Additional Navigation Options**:
    - Resident Documents
    - Board Members
- **Bulletin Board** section (appears to be for announcements)
- **Activity/Location/Details/Date** table headers (for events/announcements)

#### Resident Documents Section
Contains links to:
- **Sky Box Agenda, Minutes and Notes** (leads to minutes archive)
- **Contact Form** with fields:
    - Name
    - Email
    - Subject
    - Message
    - reCAPTCHA verification
    - Submit button
- **Budgets** (leads to budget archive)
- **Sky Box By-laws** (downloadable ZIP file)
- **Sky Box Condo Association Declaration** (downloadable ZIP file)
- **Sky Box Rules and Regulations** (downloadable PDF)
- **"Contact Us:" heading**

#### Meeting Minutes Archive (/minutes)
Organized by year with downloadable PDF files:
- Minutes and Agenda 2024
- Minutes and Agenda 2023
- Minutes and Agenda 2022
- Minutes and Agenda 2021
- Minutes and Agenda 2020
- Minutes and Agenda 2019
- Minutes and Agenda 2018
- Minutes and Agenda 2017
- Minutes and Agenda 2016

#### Budget Archive (/yearly-budgets)
Contains downloadable budget and financial documents:
- 2025 Budget
- 2024 Budget
- FY24 Transaction
- 2023 Budget
- 2022 Budget
- FY22 Q3 Transaction
- FY22 Q1 Transaction
- 2021 Budget
- 2020 Budget

#### Board Members Section (/community)
- **Current Board Members** (2019-2020 Board):
    - Michael Kmak - Board President
    - Nancy Kingsland - Board Treasury
    - Richard Straub - Board Secretary
- **Contact Form** (same as in documents section)
- **"2019-2020 Board" heading**
- **"Contact Us" heading**

## Technical Requirements

### Password Protection
- Simple password protection for resident area
- Password: "Skybox1"
- Single shared password (not individual user accounts)

### Document Management
- File upload capability for board members to add new documents
- Organized by category (minutes, budgets, rules, etc.)
- Chronological organization (reverse chronological for newest first)
- Support for PDF and ZIP file downloads

### Contact Functionality
- Contact forms throughout the site
- reCAPTCHA integration for spam protection
- Email delivery to board

### Key Features to Implement
1. **Landing page** with building information and contact details
2. **Password-protected resident section**
3. **Document repository** organized by type and year
4. **Board member information**
5. **Contact forms** for resident communication
6. **File upload interface** for board members to add documents
7. **Simple, clean design** similar to current site

## Content Priorities
1. Preserve all existing text content exactly as shown
2. Maintain document organization structure
3. Keep contact information and building address prominent
4. Ensure password protection functions correctly
5. Implement board upload functionality as discussed in transcript

## Notes from Requirements Discussion
- Board wants ability to upload files directly through the website
- Files should be organized and listed reverse chronologically
- Need to maintain simple password protection system
- Contact email should remain skyboxlofts@gmail.com
- Consider adding contractor directory and FAQ sections
- Budget contains financial information so security is important