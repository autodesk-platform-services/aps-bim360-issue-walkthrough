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
 
const { ok } = require('assert');
const config = require('../../config');  
const { get, post, patch, put,getBinary } = require('./fetch_common');  
const axios = require('axios')  
const fs = require('fs');
const path = require('path');

async function getIssues(containerId,
  allIssues,
  offset,
  limit = 100,
  filters = {}) {
  try {
    let endpoint = config.endpoints.bim360Issues.get_issues.format(containerId)
      + `?offset=${offset}&limit=${limit}`
    //apply with filters
    Object.keys(filters).forEach(e => {
      endpoint += `&filter[${e}]=${filters[e]}`
    });
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    if (response.results && response.results.length > 0) {
      console.log(`getting issues of container ${containerId}`)
      allIssues = allIssues.concat(response.results);
      if (response.pagination.totalResults > allIssues.length) {
        offset += 100
        return getIssues(containerId, allIssues, offset);
      }
      else {
        return allIssues
      }
    } else {
      return allIssues
    }
  } catch (e) {
    console.error(`getting issues of  ${containerId} failed: ${e}`)
    return {}
  }
}

async function getOneIssue(containerId,issueId) {
  try {
    let endpoint = config.endpoints.bim360Issues.get_one_issue.format(containerId,issueId) 
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)
     
    console.log(`getting one issue ${issueId} of container ${containerId}`)
    return response
     
  } catch (e) {
    console.error(`getting one issues ${issueId} of container ${containerId} failed: ${e}`)
    return {}
  }
}

 
async function getSubTypes(containerId,
  allSubTypes,
  offset,
  limit = 100) {
  try {
    let endpoint = config.endpoints.bim360Issues.get_issue_types.format(containerId)
      + `?include=subtypes&offset=${offset}&limit=${limit}`
   
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    if (response.results && response.results.length > 0) {
      console.log(`getting issue sub types of container ${containerId}`)
      response.results.forEach(t=>{
        allSubTypes = allSubTypes.concat(t.subtypes);
      }) 
      if (response.pagination.totalResults > response.results.length) {
        offset += 100
        return getSubTypes(containerId, allSubTypes, offset);
      }
      else {
        return allSubTypes
      }
    } else {
      return allSubTypes
    }
  } catch (e) {
    console.error(`getting issue sub types of  ${containerId} failed: ${e}`)
    return {}
  }
}


async function getRootCauses(containerId,
  allRootCauses,
  offset,
  limit = 100) {
  try {
    let endpoint = config.endpoints.bim360Issues.get_root_categories.format(containerId)
      + `?include=rootcauses&offset=${offset}&limit=${limit}`
   
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    if (response.results && response.results.length > 0) {
      console.log(`getting issue root causes of container ${containerId}`)
      response.results.forEach(t=>{
        allRootCauses = allRootCauses.concat(t.rootCauses);
      }) 
      if (response.pagination.totalResults > response.results.length) {
        offset += 100
        return getRootCauses(containerId, allRootCauses, offset);
      }
      else {
        return allRootCauses
      }
    } else {
      return allRootCauses
    }
  } catch (e) {
    console.error(`getting issue root causes of  ${containerId} failed: ${e}`)
    return {}
  }
}


async function getAttributesDefs(containerId,
  allAttributesDefs,
  offset,
  limit = 100) {
  try {
    let endpoint = config.endpoints.bim360Issues.get_issue_attributes_defs.format(containerId)
      + `?offset=${offset}&limit=${limit}`
   
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    if (response.results && response.results.length > 0) {
      console.log(`getting issue custom attributes defs of container ${containerId}`)
      allAttributesDefs = allAttributesDefs.concat(response.results);
      if (response.pagination.totalResults > allAttributesDefs.length) {
        offset += 100
        return getRootCauses(containerId, allAttributesDefs, offset);
      }
      else {
        return allAttributesDefs
      }
    } else {
      return allAttributesDefs
    }
  } catch (e) {
    console.error(`getting issue custom attributes defs of  ${containerId} failed: ${e}`)
    return {}
  }
} 


async function getComments(containerId,
  allComments,
  issueId,
  offset,
  limit = 100) {
  try {
    let endpoint = config.endpoints.bim360Issues.get_issue_comments.format(containerId,issueId)
      + `?offset=${offset}&limit=${limit}`
   
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    if (response.results && response.results.length > 0) {
      console.log(`getting issue ${issueId} comments `)
      allComments = allComments.concat(response.results);
      if (response.pagination.totalResults > allComments.length) {
        offset += 100
        return getRootCauses(containerId, allComments, offset);
      }
      else {
        return allComments
      }
    } else {
      return allComments
    }
  } catch (e) {
    console.error(`getting issue ${issueId} comments failed: ${e}`)
    return {}
  }
}


async function getAttachements(containerId,
  allAttachements,
  issueId,
  offset,
  limit = 100) {
  try {
    let endpoint = config.endpoints.bim360Issues.get_issue_attachments.format(containerId,issueId)
      + `?offset=${offset}&limit=${limit}`
   
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    if (response.results && response.results.length > 0) {
      console.log(`getting issue ${issueId} attachments `)
      allAttachements = allAttachements.concat(response.results);
      if (response.pagination.totalResults > allAttachements.length) {
        offset += 100
        return getRootCauses(containerId, allAttachements, offset);
      }
      else {
        return allAttachements
      }
    } else {
      return allAttachements
    }
  } catch (e) {
    console.error(`getting issue ${issueId} attachments failed: ${e}`)
    return {}
  }
} 


async function createIssue(containerId,payload) {
  try {
    const endpoint = config.endpoints.bim360Issues.get_issues.format(containerId)   
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged) 
    headers['Content-Type'] = 'application/json' 
 
    const response = await post(endpoint, headers,payload); 
    console.log(`creating one issue in container ${containerId}`) 
    return response  
  } catch (e) {
    console.error(`creating one issue in container ${containerId} failed: ${e}`)
    return null
  }
}  

async function addComment(containerId,issueId,payload) {
  try {
    const endpoint = config.endpoints.bim360Issues.create_issue_comment.format(containerId,issueId)   
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged) 
    headers['Content-Type'] = 'application/json' 

    const response = await post(endpoint, headers,payload); 
    console.log(`creating comment for one issue ${issueId}`) 
    return response  
  } catch (e) {
    console.error(`creating comment for one issue failed: ${e}`)
    return null
  }
}  

//#region add attachment

async function createAttachment(containerId,issueId,fileName) {
  try {
    const endpoint = config.endpoints.bim360Issues.create_issue_attachments.format(containerId,issueId)   
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged) 
    headers['Content-Type'] = 'application/json' 

    const payload = {
      name:fileName,
      urnType:'oss'
    }

    const response = await post(endpoint, headers,JSON.stringify(payload)); 
    console.log(`creating attachment for one issue ${issueId}`) 
    return response  
  } catch (e) {
    console.error(`creating attachment for one issue failed: ${e}`)
    return null
  }
}  

async function getS3SignedDownloadUrl(bucketKey,objectKey) {
  try {
    const endpoint = config.endpoints.dataManagement.s3_signed_download.format(bucketKey,objectKey)   
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged) 
    const response = await get(endpoint, headers);

    if (response) {
      console.log(`getS3SignedDownloadUrl...` )
      return response 
    } else {
      return null
    }
  } catch (e) {
    console.error(`getS3SignedDownloadUrl failed: ${e}`)
    return null
  }
}

async function getS3SignedUploadUrl(bucketKey,objectKey) {
  try {
    const endpoint = config.endpoints.dataManagement.s3_signed_upload.format(bucketKey,objectKey)   
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged) 
    const response = await get(endpoint, headers);

    if (response) {
      console.log(`getS3SignedUploadUrl...` )
      return response 
    } else {
      return null
    }
  } catch (e) {
    console.error(`getS3SignedUploadUrl failed: ${e}`)
    return null
  }
}

async function uploadBinary(signedUrl,fileBody){
  try {
    console.log(`uploading binary.....` )
    const response = await axios.put(signedUrl,fileBody); 
    console.log(`uploadBinary done...` )
    return response  
  } catch (e) {
    console.error(`uploadBinary failed: ${e}`)
    return null 
  }
}

async function completeS3SignedUrl(bucketKey,objectKey,payload) {
  try {
    const endpoint = config.endpoints.dataManagement.s3_signed_upload.format(bucketKey,objectKey)   
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged) 
    headers['Content-Type'] = 'application/json' 

    const response = await post(endpoint, headers,payload); 
    console.log(`completeS3SignedUrl...` )
    return response  
  } catch (e) {
    console.error(`completeS3SignedUrl failed: ${e}`)
    return null
  }
} 

async function updateAttachmentWithServer(containerId,issueId,attachmentId) {
  try {
    const endpoint = config.endpoints.bim360Issues.update_issue_attachment_with_server.format(containerId,issueId,attachmentId)
                      +`?task=post-upload-process` 
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged) 
    headers['Content-Type'] = 'application/json' 

    const payload = { 
    }

    const response = await post(endpoint, headers,JSON.stringify(payload)); 
    console.log(`creating attachment for one issue ${issueId}`) 
    return response  
  } catch (e) {
    console.error(`creating attachment for one issue failed: ${e}`)
    return null
  }
} 

// Endpoints for Adding Attachments
//Tutorial: https://aps.autodesk.com/en/docs/bim360/v1/tutorials/issuesv2/attach-local-attachment-issues-v2
async function addAttachment(containerId,issueId,fileName,fileBody) {
  try { 
    //Step 1: Create a storage object in the attachment folder
    var res = await createAttachment(containerId,issueId,fileName)
    const urn = res.urn
    const attachmentId = res.id
    //extract bucket key and object key of oss object
    var split_by_splash = urn.split("/") 
    var split_by_colon = split_by_splash[0].split(":")
    const attachment_object_key = split_by_splash[1]
    const attachment_bucket_key = split_by_colon[3] 

    //Step 2: Generate a signed S3 URL
    res = await getS3SignedUploadUrl(attachment_bucket_key,attachment_object_key)
    const s3_upload_url = res.urls[0]
    const s3_upload_key = res.uploadKey

    //Step 3: Initiate upload of a file to the signed URL
    await uploadBinary(s3_upload_url,fileBody)

    //Step 4: Complete the Upload
    var payload = { uploadKey: s3_upload_key } 
    await completeS3SignedUrl(attachment_bucket_key,attachment_object_key,JSON.stringify(payload))

    //Step 5: Update issue service that the file has been uploaded
    await updateAttachmentWithServer(containerId,issueId,attachmentId) 

    return 'succeeded'

  } catch (e) {
    console.error(`add attachment for one issue  ${issueId} failed: ${e}`)
    return null
  }
} 

//Endpoints for downloading Attachments
async function downloadAttachment(urn,name) {
  try { 
    //extract bucket key and object key of oss object
    var split_by_splash = urn.split("/") 
    var split_by_colon = split_by_splash[0].split(":")
    const attachment_object_key = split_by_splash[1]
    const attachment_bucket_key = split_by_colon[3] 

    //Generate a signed S3 URL
    const res = await getS3SignedDownloadUrl(attachment_bucket_key,attachment_object_key)
    const s3_download_url = res.url 
    const file_full_path_name = path.join(__dirname, '../../Files/' + name) 

    const fileStream = fs.createWriteStream(file_full_path_name);
    const body = await getBinary(s3_download_url) 

    await new Promise((resolve, reject) => {
      body.pipe(fileStream);
      body.on("error", reject);
      fileStream.on("finish", resolve);
      console.log('Attachment File Saved.')  
    });

    return file_full_path_name 

  }catch (e) {
    console.error(`download attachment for urn = ${urn} failed: ${e}`)
    return null
  }
}

//#endregion 

module.exports = {
  getIssues,
  getSubTypes,
  getRootCauses,
  getAttributesDefs,

  getOneIssue,
  getComments,
  getAttachements,

  createIssue,
  addComment,
  addAttachment,
  downloadAttachment
}










