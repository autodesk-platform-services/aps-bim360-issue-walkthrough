
import { loadModel, setPushpinData } from './viewer.js';
var currentContainerId = null;
async function getIssueSubTypes(containerId) {
    const res = await fetch(`/api/issueSubTypes/${containerId}`);
    const issueSubTypes = await res.json();
    return issueSubTypes.map(t => $('#dropdownIssueTypes').append($('<option>').val(t.id).text(t.title)));
}

export async function initIssueDefs(projectId, containerId) {
    const res = await fetch(`/api/issueDataMap/${projectId}/${containerId}`);
    await getIssueSubTypes(containerId);
}

export async function createIssue(payload) {

    const res = await fetch(`/api/createIssue/${currentContainerId}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ payload: payload })
        });
    $('#issueTree').jstree(true).refresh();


}

export async function createComment(containerId, issueId, comment) {
    const res = await fetch(`/api/createComment/${containerId}/${issueId}`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ comment: comment })
        });

    $('#issueTree').jstree(true).refresh();

}

export async function createAttachment(containerId, issueId, formData) {

    const res = await fetch(`/api/createAttachment/${containerId}/${issueId}`, 
                            { method: "POST", body:formData}
                            ); 
}

export function prepareBIMIssuesTree(containerId) {
    currentContainerId = containerId;
    var thisIssueTree = $('#issueTree').jstree(true);
    if (thisIssueTree) { thisIssueTree.destroy(); }

    $('#issueTree').jstree({
        core: {
            themes: { icons: true },
            data: {
                url: `/api/${containerId}/issuesTree`,
                dataType: "json",
                multiple: false,
                cache: false,
                data: function (node) {
                    $('#issueTree').jstree(true).toggle_node(node);
                    if (node.id == '#') {
                        var date_input = new Date($("#issueDueDate").val());
                        var one_day_late = date_input;
                        var due_date = date_input.getFullYear() + '-' + ('0' + (date_input.getMonth() + 1)).slice(-2) + '-' + ('0' + date_input.getDate()).slice(-2);

                        one_day_late.setDate(date_input.getDate() + 1);
                        one_day_late = one_day_late.getFullYear() + '-' + ('0' + (one_day_late.getMonth() + 1)).slice(-2) + '-' + ('0' + one_day_late.getDate()).slice(-2);
                        return {
                            id: node.id,
                            containerId: containerId,
                            filter: { dueDate: `${due_date}` }
                        };
                    }
                    else
                        return { id: node.id, type: node.type, data: node.data };

                },
                success: function (node) {
                }
            }
        },
        types: {
            default: {
                icon: 'fal fa-border-none'
            },
            '#': {
                icon: 'fal fa-border-none'
            },
            issues: {
                icon: 'fas fa-exclamation-triangle'
            }, 
            attachmentscoll: {
                icon: 'fas fa-paperclip'
            },
            attributescoll: {
                icon: ''
            },
            commentscoll: {
                icon: 'fas fa-layer-group'
            },
            comments: {
                icon: 'far fa-comments'
            },
            attachments: {
                icon: 'far fa-images'
            },
            attributes: {
                icon: ''
            },   
            attributesData: {
                icon: ''
            },  
            commentsdata: {
                icon: ''
            },
            pushpin: {
                icon: 'far fa-file'
            },
            pushpindata: {
                icon: ''
            }
        },
        plugins:
            ["types", "state", "sort"]
    }).bind("activate_node.jstree", function (evt, data) {
        if (data != null && data.node != null) {
            switch (data.node.type) {
                case 'issues':
                    break;
                case 'pushpin':
                    const linkedDocument = data.node.data.linkedDocument;
                    const viewable = linkedDocument.details.viewable;
                    const is3D = viewable.is3D;
                    const guid = viewable.guid;
                    const viewerState = linkedDocument.details.viewerState;
                    const seedUrn = is3D ? viewerState.seedURN : '';
                    const position = linkedDocument.details.position;
                    const objectId = linkedDocument.details.objectId;
                    setPushpinData({
                        position: position,
                        objectId: objectId,
                        id: data.node.data.id,
                        title: data.node.data.title,
                        status: data.node.data.status,
                        viewerState: viewerState
                    })
                    loadModel(seedUrn, guid);

                    break;
                case 'attachments':
                    window.location = '/api/downloadAttachment?urn=' + data.node.data.attachmentUrn + '&name=' + data.node.text;
                    break;
            }
        }
    });
}

 