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
 
const config = require('../../config');  
const { get, post, patch, put } = require('./fetch_common');  
const axios = require('axios')  
 

async function getProjectUsers(projectId,
  allUsers,
  offset,
  limit = 100,
  filters = {}) {
  try {
    let endpoint = config.endpoints.admin.get_project_users.format(projectId)
      + `?offset=${offset}&limit=${limit}`
    //apply with filters
    Object.keys(filters).forEach(e => {
      endpoint += `&${e}=${filters[e]}`
    });
    const headers = config.endpoints.httpHeaders(config.credentials.token_3legged)
    const response = await get(endpoint, headers)

    if (response.results && response.results.length > 0) {
      console.log(`getting users of projects ${projectId}`)
      allUsers = allUsers.concat(response.results);
      if (response.pagination.totalResults > allUsers.length) {
        offset += 100
        return getProjectUsers(projectId, allUsers, offset);
      }
      else {
        return allUsers
      }
    } else {
      return allUsers
    }
  } catch (e) {
    console.error(`getting project users of  ${projectId} failed: ${e}`)
    return {}
  }
} 

module.exports = { 
  getProjectUsers
}










