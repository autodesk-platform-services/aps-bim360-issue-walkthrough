/////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved
// Written by Developer Acvocacy and Support
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const multer = require('multer')
const formidable = require('formidable');

const config = require('../../config');
const { authRefreshMiddleware } = require('../services/oauth');
const issues_services = require('../services/issues');
const admin_services = require('../services/admin');
const upload = multer({ dest: './Image_Files/' });

var issue_def_data_map = {

}
router.get('/api/issueDataMap/:projectId/:containerId', authRefreshMiddleware, async (req, res) => {

  config.credentials.token_3legged = req.internalOAuthToken.access_token;
  const { projectId, containerId } = req.params;

  try {
    var subTypes = []
    subTypes = await issues_services.getSubTypes(containerId, subTypes, 0, 100)
    var rootCauses = []
    rootCauses = await issues_services.getRootCauses(containerId, rootCauses, 0, 100)
    var projectUsers = []
    projectUsers = await admin_services.getProjectUsers(projectId, projectUsers, 0, 100)

    issue_def_data_map[containerId] = {
      subTypes: subTypes,
      rootCauses: rootCauses,
      projectUsers: projectUsers
    }
    res.end();
  } catch (e) {
    console.error(`/api/issueSubTypes/:containerId:${e.message}`)
    res.end();
  }
});

router.get('/api/issueSubTypes/:containerId', authRefreshMiddleware, async (req, res) => {

  config.credentials.token_3legged = req.internalOAuthToken.access_token;
  const { containerId } = req.params;
  try {
    //var subTypes = []
    //subTypes = await issues_services.getSubTypes(containerId,subTypes,0,100)
    var subTypes = issue_def_data_map[containerId].subTypes;
    res.json(subTypes)
  } catch (e) {
    console.error(`/api/issueSubTypes/:containerId:${e.message}`)
    res.status(500).end()
  }
});

router.get('/api/:containerId/issuesTree', authRefreshMiddleware, async (req, res) => {

  config.credentials.token_3legged = req.internalOAuthToken.access_token;
  const { containerId } = req.params;

  var returnJson = [];
  try {
    if (req.query.id == '#') {
      const filter = req.query.filter
      //get issues collection with the filter
      var allIssues = []
      allIssues = await issues_services.getIssues(containerId, allIssues, 0, 100, filter)

      await Promise.all(allIssues.map(async (item) => {
        const jsonTreeId = `issue|id=${item.id}`
        const title = item.title == null ? '<No Title>' : item.title

        returnJson.push(prepareItemForIssueTree(
          jsonTreeId,
          title,
          'issues',
          true,
          { containerId: containerId, issueId: item.id }
        ))
      }));

    } else {
      switch (req.query.type) {
        case 'issues':
          //some attributes
          returnJson = getIssueContents(containerId, req.query.data.issueId);
          break;
        case 'commentscoll':
          var allComments = []
          allComments = await issues_services.getComments(containerId, allComments, req.query.data.issueId, 0, 100);

          await Promise.all(allComments.map(async (item) => {
            const jsonTreeId = `${item.id}`;
            const creator = issue_def_data_map[containerId].projectUsers.find(i => i.autodeskId == item.createdBy);
            const title = `created by ${creator.firstName} ${creator.lastName} At ${item.createdAt}`

            returnJson.push(prepareItemForIssueTree(
              jsonTreeId,
              title,
              'comments',
              true,
              {
                containerId: containerId,
                created_at: item.createdAt,
                body: item.body,
                updated_at: item.updatedAt,
                created_by: `${creator.firstName} ${creator.lastName}`
              }
            ));
          }));
          break;
        case 'attachmentscoll':
          var allAttachments = []
          allAttachments = await issues_services.getAttachements(containerId, allAttachments, req.query.data.issueId, 0, 100);

          await Promise.all(allAttachments.map(async (item) => {
            const jsonTreeId = `${item.id}`;
            const creator = issue_def_data_map[containerId].projectUsers.find(i => i.autodeskId == item.createdBy);
            const title = `${item.name}`;

            returnJson.push(prepareItemForIssueTree(
              jsonTreeId,
              title,
              'attachments',
              false,
              {
                attachmentUrn: item.urn,
                attachmentType: item.attachmentType,
                createdAt: item.createdAt,
                urnType: item.urnType,
                status: item.status,
                updatedAt: item.updatedAt,
                createdBy: `${creator.firstName} ${creator.lastName}`
              }
            ));
          }));
          break;
        case 'comments':
          returnJson = getOneComment(req.query.data);
          break;
        case 'attachments':
          //returnJson = getOneAttachment(req.query.data);
          //download attachment directly. not display attachment data.
          break;
        case 'attributescoll':
          var att = await issues_services.getOneIssue(containerId, req.query.data.issueId);
          returnJson.push(prepareItemForIssueTree('', `Title:${att.title}`, 'attributes', false, {}));
          returnJson.push(prepareItemForIssueTree('', `Description:${att.description}`, 'attributes', false, {}));
          returnJson.push(prepareItemForIssueTree('', `Status: ${att.status}`, 'attributes', false, {}));
          returnJson.push(prepareItemForIssueTree('', `DueDate: ${att.dueDate}`, 'attributes', false, {}));
          let rootCause = issue_def_data_map[containerId].rootCauses.find(i => i.id == att.rootCauseId);
          rootCause = rootCause ? rootCause.title : `<Not Found>`;
          returnJson.push(prepareItemForIssueTree('', `RootCause:${rootCause}`, 'attributes', false, {}));
          let subType = issue_def_data_map[containerId].subTypes.find(i => i.id == att.issueSubtypeId);
          subType = subType ? subType.title : `<Not Found>`;
          returnJson.push(prepareItemForIssueTree('', `SubType:${subType}`, 'attributes', false, {}));
          let assignee = issue_def_data_map[containerId].projectUsers.find(i => i.autodeskId == att.assignedTo);
          assignee = assignee ? `${assignee.firstName} ${assignee.lastName}` : `<Not Found>`;
          returnJson.push(prepareItemForIssueTree('', `Assignee: ${assignee}`, 'attributes', false, {}));

          //linkedDocument (pushpin)
          if (att.linkedDocuments && att.linkedDocuments.length > 0) {
            returnJson.push(prepareItemForIssueTree('', `Linked Document`, 'pushpin', true,
              {
                id: att.id,
                status: att.status,
                title: att.title,
                linkedDocument: att.linkedDocuments[0]
              }));
          }

          break;
        case 'pushpin':
          returnJson = getOnePushpin(req.query.data.linkedDocument);

          //add some required  from issue basic attributes, for creating pushpin in APS viewer.
          returnJson.title = req.query.data.title;
          returnJson.status = req.query.data.status;
          returnJson.id = req.query.data.id;

          break;
      }
    }
    res.json(returnJson);

  } catch (e) {
    console.error(`/api/:containerId/issuesTree:${e.message}`)
    res.end();
  }

})


router.post('/api/createIssue/:containerId', authRefreshMiddleware, async (req, res) => {

  config.credentials.token_3legged = req.internalOAuthToken.access_token;
  const { containerId } = req.params;
  const payload = req.body.payload;

  try {
    const r = await issues_services.createIssue(containerId, JSON.stringify(payload));
    res.status(200).end();
  } catch (e) {
    console.error(`/api/createIssue/:containerId:${e.message}`)
    res.status(500).end()
  }
});

router.post('/api/createComment/:containerId/:issueId', authRefreshMiddleware, async (req, res) => {

  config.credentials.token_3legged = req.internalOAuthToken.access_token;
  const { containerId, issueId } = req.params;
  const comment = req.body.comment;
  const payload = {
    issueId: issueId,
    body: comment
  }
  try {
    const r = await issues_services.addComment(containerId, issueId, JSON.stringify(payload));
    res.status(200).end();
  } catch (e) {
    console.error(`/api/createComments/:containerId/:issueId:${e.message}`)
    res.status(500).end()
  }
});

router.post('/api/createAttachment/:containerId/:issueId', authRefreshMiddleware, upload.single('png'), async (req, res) => {

  config.credentials.token_3legged = req.internalOAuthToken.access_token;
  const { containerId, issueId } = req.params;

  let arr = []
  const rs = fs.createReadStream(req.file.path);
  const fileName = req.file.originalname;

  rs.on('data', chunk => {
    arr.push(chunk)
  })
  rs.on('end', async chunk => {
    var fileBody = Buffer.concat(arr)
   
    try {
      const r = await issues_services.addAttachment(containerId, issueId, fileName, fileBody);
      if(r == 'succeeded')
         res.status(200).end();
      else
         res.status(500).end();
 
    } catch (err) {
       console.error(`/api/createAttachment/:containerId/:issueId:${e.message}`)
       res.status(500).end()
    }
  }
  )

  // const fileName = req.body.fileName;

  // //read file body
  // const file_full_path = path.join(__dirname, `../../Files/${fileName}`)

  // var fileBody = fs.readFileSync(file_full_path)
  // try {
  //   const r = await issues_services.addAttachment(containerId, issueId, fileName, fileBody);
  //   res.status(200).end();
  // } catch (e) {
  //   console.error(`/api/createAttachment/:containerId/:issueId:${e.message}`)
  //   res.status(500).end()
  // }
});


router.get('/api/downloadAttachment', authRefreshMiddleware, async (req, res) => {

  config.credentials.token_3legged = req.internalOAuthToken.access_token;
  const urn = req.query.urn;
  const name = req.query.name;

  try {
    const file_full_path_name = await issues_services.downloadAttachment(urn, name);
    res.download(file_full_path_name);
  } catch (e) {
    console.error(`/api/issueSubTypes/:containerId:${e.message}`)
    res.end();
  }
});

router.post('/api/uploadFile',upload.single('png'), async (req, res) => {
 
  let arr = []
  const rs = fs.createReadStream(req.file.path);

  rs.on('data', chunk => {
    arr.push(chunk)
  })
  rs.on('end', async chunk => {
    var fileBody = Buffer.concat(arr)

    try {
      //const r = await issues_services.addAttachment(containerId, issueId, fileName, fileBody);
      
      res.status(200).end();
  
    } catch (err) {
       console.error(`/api/createAttachment/:containerId/:issueId:${e.message}`)
       res.status(500).end()
    }
  })
});

function prepareItemForIssueTree(_id, _text, _type, _children, _data) {
  return {
    id: _id,
    text: _text,
    type: _type,
    children: _children,
    data: _data
  }
}

function getIssueContents(containerId, issueId) {

  var returnJson = [];
  //attributes
  returnJson.push(prepareItemForIssueTree(
    '',
    'Attributes',
    'attributescoll',
    true,
    { containerId: containerId, issueId: issueId }
  ));

  //comments collection
  returnJson.push(prepareItemForIssueTree(
    '',
    'Comments',
    'commentscoll',
    true,
    { containerId: containerId, issueId: issueId }

  ));

  //attachments collection
  returnJson.push(prepareItemForIssueTree(
    '',
    'Attachments',
    'attachmentscoll',
    true,
    { containerId: containerId, issueId: issueId }
  ));

  return returnJson;

}

function getOneComment(commentsData) {

  var returnJson = [];
  returnJson.push(prepareItemForIssueTree(
    '',
    'createdAt: ' + commentsData.createdAt,
    'commentsdata',
    false
  ));

  returnJson.push(prepareItemForIssueTree(
    '',
    'createdBy: ' + commentsData.createdBy,
    'commentsdata',
    false
  ));

  returnJson.push(prepareItemForIssueTree(
    '',
    'body: ' + commentsData.body,
    'commentsdata',
    false
  ));

  returnJson.push(prepareItemForIssueTree(
    '',
    'updated_at: ' + commentsData.updated_at,
    'commentsdata',
    false
  ));
  return returnJson;
}

function getOnePushpin(pushpinData) {

  var returnJson = [];

  returnJson.push(prepareItemForIssueTree(
    '',
    'type: ' + pushpinData.type,
    'pushpindata',
    false
  ));

  returnJson.push(prepareItemForIssueTree(
    '',
    'urn: ' + pushpinData.urn,
    'pushpindata',
    false
  ));

  var details = pushpinData.details;
  var location = `( ${details.position.x},${details.position.y},${details.position.z})`;
  returnJson.push(prepareItemForIssueTree(
    '',
    'location: ' + location,
    'pushpindata',
    false
  ));

  returnJson.push(prepareItemForIssueTree(
    '',
    'objectId: ' + details.objectId,
    'pushpindata',
    false
  ));

  returnJson.push(prepareItemForIssueTree(
    '',
    'is3D: ' + details.is3D,
    'pushpindata',
    false
  ));

  returnJson.push(prepareItemForIssueTree(
    '',
    'viewerable_name: ' + details.viewable.name,
    'pushpindata',
    false,
    {
      guid: details.viewable.guid,
      viewableId: details.viewable.guid
    }
  ));

  return returnJson;
}

module.exports = router;
