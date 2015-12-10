import TagNode from './nodes/TagNode';
import ComponentNode from './nodes/ComponentNode';
import FunctionComponentNode from './nodes/FunctionComponentNode';
import Input from './components/Input';
import Textarea from './components/Textarea';
import Select from './components/Select';

const WRAPPER_COMPONENTS = {
    input : Input,
    textarea : Textarea,
    select : Select
};

function createNode(type) {
    switch(typeof type) {
        case 'string':
            return WRAPPER_COMPONENTS[type]?
                new ComponentNode(WRAPPER_COMPONENTS[type]) :
                new TagNode(type);

        case 'function':
            return type.__vidom__component__?
                new ComponentNode(type) :
                new FunctionComponentNode(type);

        default:
            throw Error('unsupported node type: ' + typeof type);
    }
}

export default createNode;
