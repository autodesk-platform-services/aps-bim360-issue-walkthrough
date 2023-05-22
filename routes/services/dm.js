const APS = require('forge-apis');
const { APS_CLIENT_ID, APS_CLIENT_SECRET, APS_CALLBACK_URL, INTERNAL_TOKEN_SCOPES, PUBLIC_TOKEN_SCOPES } = require('../../config');

const internalAuthClient = new APS.AuthClientThreeLegged(APS_CLIENT_ID, APS_CLIENT_SECRET, APS_CALLBACK_URL, INTERNAL_TOKEN_SCOPES);

const service = module.exports = {};
service.getHubs = async (token) => {
    const resp = await new APS.HubsApi().getHubs(null, internalAuthClient, token);
    return resp.body.data.filter(i=>i.attributes.extension.type == 'hubs:autodesk.bim360:Account');
};

service.getProjects = async (hubId, token) => {
    const resp = await new APS.ProjectsApi().getHubProjects(hubId, null, internalAuthClient, token);
    return resp.body.data;
};

service.getProjectContents = async (hubId, projectId, folderId, token) => {
    if (!folderId) {
        const resp = await new APS.ProjectsApi().getProjectTopFolders(hubId, projectId, internalAuthClient, token);
        return resp.body.data;
    } else {
        const resp = await new APS.FoldersApi().getFolderContents(projectId, folderId, null, internalAuthClient, token);
        return resp.body.data;
    }
};

service.getItemVersions = async (projectId, itemId, token) => {
    const resp = await new APS.ItemsApi().getItemVersions(projectId, itemId, null, internalAuthClient, token);
    return resp.body.data;
};