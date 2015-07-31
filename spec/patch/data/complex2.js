var createNode = require('../../../lib/createNode'),
    patchOps = require('../../../lib/client/patchOps'),
    nodeB = createNode('a').key('b'),
    nodeC = createNode('a').key('c'),
    nodeD = createNode('a').key('d'),
    nodeE = createNode('a').key('e'),
    nodeF = createNode('a').key('f'),
    parentNode = createNode('div');

module.exports = {
    'name' : 'complex2',
    'trees' : [
        parentNode.children([
            createNode('a').key('a'),
            nodeC,
            nodeE
        ]),
        createNode('div').children([
            createNode('a').key('a'),
            nodeB,
            createNode('a').key('c'),
            nodeD,
            createNode('a').key('e'),
            nodeF
        ])
    ],
    'patch' : [
        { op : patchOps.insertChild, args : [parentNode, nodeB, nodeC] },
        { op : patchOps.insertChild, args : [parentNode, nodeD, nodeE] },
        { op : patchOps.appendChild, args : [parentNode, nodeF] }
    ]
};