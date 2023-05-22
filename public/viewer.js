/// import * as Autodesk from "@types/forge-viewer";
var viewer = null;
var pushpinData = null;

async function getAccessToken(callback) {
    try {
        const resp = await fetch('/api/auth/token');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const { access_token, expires_in } = await resp.json();
        callback(access_token, expires_in);
    } catch (err) {
        alert('Could not obtain access token. See the console for more details.');
        console.error(err);
    }
}

export function initViewer(container) {
    return new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer({ getAccessToken }, async function () {
            const v = new Autodesk.Viewing.GuiViewer3D(container);
            v.start();
            v.setTheme('light-theme');
            viewer = v;
            resolve(v);
        });
    });
}

export function loadModel(urn, guid) {
    function onDocumentLoadSuccess(doc) {
        var viewables = (guid ? doc.getRoot().findByGuid(guid) : doc.getRoot().getDefaultGeometry());
        viewer.loadDocumentNode(doc, viewables);
        viewer.addEventListener(Autodesk.Viewing.GEOMETRY_LOADED_EVENT, onGeometryLoaded);
    }
    function onDocumentLoadFailure(code, message) {
        alert('Could not load model. See console for more details.');
        console.error(message);
    }
    Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
}

export function setPushpinData(v) {
    pushpinData = v;
}

async function onGeometryLoaded(evt) {

    //load extension of pushpin
    var ext = await viewer.loadExtension('Autodesk.BIM360.Extension.PushPin');

    //remove last items collection
    ext.removeAllItems();
    ext.showAll();

    var pushpin = [];
    pushpin.push({
        type: 'issues', 
        id: pushpinData.id,
        label: pushpinData.title,
        status: pushpinData.status,
        position: pushpinData.position,
        objectId: pushpinData.objectId,
        viewerState: pushpinData.viewerState
    }); 
    ext.loadItems(pushpin); 
 }