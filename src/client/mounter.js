import getDomNodeId from './getDomNodeId';
import rafBatch from './rafBatch';
import emptyObj from '../utils/emptyObj';
import globalHook from '../globalHook';

const mountedNodes = {};
let counter = 0;

function mount(domNode, tree, cb, cbCtx, syncMode) {
    let domNodeId = getDomNodeId(domNode),
        mounted = mountedNodes[domNodeId],
        mountId;

    if(mounted && mounted.tree) {
        mountId = ++mounted.id;
        const patchFn = () => {
            if(mountedNodes[domNodeId] && mountedNodes[domNodeId].id === mountId) {
                mounted.tree.patch(tree);
                mounted.tree = tree;
                callCb(cb, cbCtx);
            }
        };
        syncMode? patchFn() : rafBatch(patchFn);
    }
    else {
        mountedNodes[domNodeId] = { tree : null, id : mountId = ++counter };

        let existingDom = domNode.firstElementChild;
        if(existingDom) {
            mountedNodes[domNodeId].tree = tree;
            tree.adoptDom(existingDom);
            tree.mount();
            callCb(cb, cbCtx);
            if(process.env.NODE_ENV !== 'production') {
                globalHook.emit('mount', tree);
            }
        }
        else {
            const renderFn = () => {
                if(mountedNodes[domNodeId] && mountedNodes[domNodeId].id === mountId) {
                    mountedNodes[domNodeId].tree = tree;
                    domNode.appendChild(tree.renderToDom());
                    tree.mount();
                    callCb(cb, cbCtx);
                    if(process.env.NODE_ENV !== 'production') {
                        globalHook.emit('mount', tree);
                    }
                }
            };

            syncMode? renderFn() : rafBatch(renderFn);
        }
    }
}

function unmount(domNode, cb, cbCtx, syncMode) {
    const domNodeId = getDomNodeId(domNode);
    let mounted = mountedNodes[domNodeId];

    if(mounted) {
        const mountId = ++mounted.id,
            unmountFn = () => {
                mounted = mountedNodes[domNodeId];
                if(mounted && mounted.id === mountId) {
                    delete mountedNodes[domNodeId];
                    const tree = mounted.tree;
                    if(tree) {
                        const treeDomNode = tree.getDomNode();
                        tree.unmount();
                        domNode.removeChild(treeDomNode);
                    }
                    callCb(cb, cbCtx);
                    if(process.env.NODE_ENV !== 'production') {
                        tree && globalHook.emit('unmount', tree);
                    }
                }
            };

        mounted.tree?
            syncMode? unmountFn() : rafBatch(unmountFn) :
            syncMode || callCb(cb, cbCtx);
    }
    else if(!syncMode) {
        callCb(cb, cbCtx);
    }
}

function callCb(cb, cbCtx) {
    cb && cb.call(cbCtx || this);
}

export function mountToDom(domNode, tree, cb, cbCtx) {
    mount(domNode, tree, cb, cbCtx, false);
}

export function mountToDomSync(domNode, tree) {
    mount(domNode, tree, null, null, true);
}

export function unmountFromDom(domNode, cb, cbCtx) {
    unmount(domNode, cb, cbCtx, false);
}

export function unmountFromDomSync(domNode) {
    unmount(domNode, null, null, true);
}

export function getMountedRootNodes() {
    const res = [];
    let id,
        mountedNode;

    for(let id in mountedNodes) {
        mountedNode = mountedNodes[id];
        if(mountedNode.tree) {
            res.push(mountedNode.tree);
        }
    }

    return res;
}
