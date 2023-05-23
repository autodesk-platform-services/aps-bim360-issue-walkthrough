# APS BIM360 Issue API Walkthrough
 
[![NodeJs](https://img.shields.io/badge/nodejs-14.15.4-yellow.svg)](https://nodejs.org)
[![NPM](https://img.shields.io/badge/npm-6.14.10-green.svg)](https://www.npmjs.com/)
[![Visual Studio Code](https://img.shields.io/badge/visual%20code-1.78.2-orange.svg)](https://code.visualstudio.com)

[![Authentication v2](https://img.shields.io/badge/Authentication-v2-green.svg)](https://aps.autodesk.com/en/docs/oauth/v2/overview/)
[![Data Management API](https://img.shields.io/badge/Data%20Management-v1-green.svg)](https://aps.autodesk.com/en/docs/data/v2/overview/)
[![BIM360 Admin API](https://img.shields.io/badge/BIM360%20Admin%20API-v1-green.svg)](https://aps.autodesk.com/en/docs/bim360/v1/reference/http/admin-v1-projects-projectId-users-GET/)
[![Viewer 7](https://img.shields.io/badge/Viewer-v7-green.svg)](https://aps.autodesk.com/en/docs/viewer/v7/overview/)
[![BIM 360 Issue API](https://img.shields.io/badge/BIM%20360%20Issue%20API%20V2-v2-green.svg)](https://aps.autodesk.com/en/docs/bim360/v1/reference/http/issues-v2-users-me-GET/)

![Intermediate](https://img.shields.io/badge/Level-Intermediate-blue.svg)


## Description
This repository demonstrates basic usages of BIM 360 Issues API: get some attributes of issues at specific due date, load pushpin issue, create new issue, create new comment, add local file to issue as attachment.

## Thumbnail

![thumbnail](/thumbnail.png)  


## Live version
(TBD)

# Setup
## Prerequisites
1. **BIM 360 Account**: must be Account Admin to add the app integration. [Learn about provisioning](https://aps.autodesk.com/blog/bim-360-docs-provisioning-forge-apps). 
2. **APS Account**: Learn how to create an APS Account, activate subscription and create an app at [this tutorial](https://tutorials.autodesk.io/). 
3. **Node.js**: basic knowledge with [**Node.js**](https://nodejs.org/en/).
4. **JavaScript** basic knowledge with **jQuery**
 
## Running locally
Clone this project or download it. It's recommended to install [GitHub desktop](https://desktop.github.com/). To clone it via command line, use the following (**Terminal** on MacOSX/Linux, **Git Shell** on Windows):

    git clone https://github.com/autodesk-platform-services/aps-bim360-issue-walkthrough

**Visual Sutdio Code** (Windows, MacOS):

Open the folder, at the bottom-right, select **Yes** and **Restore**. This restores the packages (e.g. Autodesk.Forge) and creates the launch.json file. See *Tips & Tricks* for .NET Core on MacOS. 

In [.env](./env) file, input the information below 
```text 
    APS_CLIENT_ID = "your id here",
    APS_CLIENT_SECRET =  "your secret here",
    APS_CALLBACK_URL = "http://localhost:3000/api/auth/callback"
```

 Via command line, navigate to the folder where this repository was cloned and use the following:

    npm install 
    node start.js

Open the browser: [http://localhost:3000](http://localhost:3000). 
 

## Usage

1. Select one project in the left panel tree.
2. select one due date on the top of the issue tree. The issues at the specific due date will be listed.
3. expand the attributes to check the values
4. click pushpin attributes if it is not null. The corresponding model will be loaded and the issue pushpin will be added by Pushpin Extension
5. fill in issue title and due date, click [create issue], one new issue will be created. 
6. select one issue in the issue tree, fill in comment body, and click [create comments], one new comment will be attached to the issue
7. select one issue in the issue tree, select one local photo. after while, expand the node of attachments of the issue to check if the file is attached with the issue. 
8. Go to BIM 360 >> Document Management >> Issue tab to check if the new issue is created, check its attachments/comments. 
  

## Documentation

- [BIM 360 API](https://developer.autodesk.com/en/docs/bim360/v1/overview/) and [App Provisioning](https://aps.autodesk.com/blog/bim-360-docs-provisioning-forge-apps)
- [Data Management API](https://developer.autodesk.com/en/docs/data/v2/overview/)
- [Viewer](https://developer.autodesk.com/en/docs/viewer/v6)
- [View BIM 360 Models](https://tutorials.autodesk.io/tutorials/hubs-browser/)
- [Retrieve Issues](https://aps.autodesk.com/en/docs/bim360/v1/tutorials/issuesv2/retrieve-issues-v2/)
- [Create Issues](https://aps.autodesk.com/en/docs/bim360/v1/tutorials/issuesv2/create-issues-v2/)

## Blogs

- [APS Blog](https://aps.autodesk.com/categories/bim-360-api)
- [Field of View](https://fieldofviewblog.wordpress.com/) 

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

## Written by

Xiaodong Liang [@coldwood](https://twitter.com/coldwood). [APS Partner Development](http://aps.autodesk.com)
