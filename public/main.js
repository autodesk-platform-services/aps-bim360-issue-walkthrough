import { initViewer, loadModel } from './viewer.js';
import { initTree } from './sidebar.js';
import {
    initIssueDefs, prepareBIMIssuesTree,
    createIssue, createComment, createAttachment
 } from './issues.js';

const login = document.getElementById('login');
try {
    const resp = await fetch('/api/auth/profile');
    if (resp.ok) {
        const user = await resp.json();
        login.innerText = `Logout (${user.name})`;
        login.onclick = () => window.location.replace('/api/auth/logout');
        const viewer = await initViewer(document.getElementById('preview'));
        initTree('#projectTree', async (projectId, containerId) => {
            await initIssueDefs(projectId, containerId);
            await prepareBIMIssuesTree(containerId);
        });
    } else {
        login.innerText = 'Login';
        login.onclick = () => window.location.replace('/api/auth/login');
    }
    login.style.visibility = 'visible';

    //initialization
    init();

} catch (err) {
    alert('Could not initialize the application. See console for more details.');
    console.error(err);
}

async function init() {

    //feather icon
    feather.replace()

    //due date box
    $('#issueDueDate').datepicker('setDate', new Date());
    $('#issueDueDate').datepicker({ autoclose: true });
    $('#newIssueDueDate').datepicker('setDate', new Date());
    $('#newIssueDueDate').datepicker({ autoclose: true });

    $('#issueDueDate').change(function () {
        const thisIssueTree = $('#issueTree').jstree(true);
        if (thisIssueTree)
            thisIssueTree.refresh();
    });

    $('#btnCreateIssue').click(function (rvt) {

        const title = $('#newIssueTitle').val();

        const dateInput = new Date($("#newIssueDueDate").val());
        const dueDate = `${dateInput.getUTCFullYear()}-${(("0" + (dateInput.getUTCMonth()+1)).slice(-2) )}-${("0" + dateInput.getUTCDate()).slice(-2)}`;
                        
        const issueSubtypeId = $('#dropdownIssueTypes').find("option:selected").val();

        const payload = {
            title: title,
            dueDate: dueDate,
            issueSubtypeId: issueSubtypeId,
            status:'open'
        }

        createIssue(payload);


    });
    $('#btnCreateComment').click(function (rvt) {

        const jsTreeInstance = $('#issueTree').jstree(true);
        const node = jsTreeInstance.get_selected(true)[0];

        if (node.type == 'issues') {
            if ($('#newComment').val() && $('#newComment').val() != '') {
                createComment(node.data.containerId, node.data.issueId, $('#newComment').val());

            } else {
                alert('please input comment body!');
            }
        } else {
            alert('please select one issue!');
        }
    });

    $('#btnCreateAttachment').click(function (rvt) {


        const jsTreeInstance = $('#issueTree').jstree(true);
        const node = jsTreeInstance.get_selected(true)[0];

        if (node.type == 'issues') {
            const fileName = $('#selectedFile').val();
            if (fileName == undefined || fileName == '') {
                alert('please select a file!');
                return;
            }

            createAttachment(node.data.containerId, node.data.issueId, fileName)

        } else {
            alert('please select one issue!');
        }



        createAttachment();
    })

    $('#selectedFile').on('change', function (evt) {

        const jsTreeInstance = $('#issueTree').jstree(true);
        const node = jsTreeInstance.get_selected(true)[0];

        if (node.type == 'issues') {
            const files = evt.target.files
            if (files.length === 1) {
                const formData = new FormData();
                formData.append('png', files[0]);
                formData.append('name', files[0].name);
                createAttachment(node.data.containerId, node.data.issueId, formData) 
            } 
        }
        //selectLocalFile(evt); 
        
    })

}

