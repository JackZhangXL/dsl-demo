import compiler_helper from "../compiler/compiler-helper";

const render = {
    generalDom(domStr){
        // domStr：原始的模板字符串
        // "<div>
        //     <div style="color: red">{{text1}}</div>
        //     {{o.text2}}
        //     <div dsl-if="isShow">{{text3}}</div>
        //     <div dsl-for="item in array1" dsl-if="isShow">
        //         {{item}}
        //     </div>
        //     <div dsl-html="htmlTemplate">不会显式这句话</div>
        // </div>"
        if (domStr instanceof Object) {
            return domStr.value;
        }
        let $temp = document.createElement("div");
        $temp.innerHTML = domStr.trim();    // 去掉多余的空格后，将原始的模板字符串无脑塞进 div 里
        return $temp.childNodes[0];         // 按照 vue 的规则，一个模板只有一个根节点，所以取 childNodes[0]
    },
    mount($node, $data){
        compiler_helper.data = $data;
        let $newDom = this.generalDom($node.$tplfn(compiler_helper));
        this.replaceNode($newDom, $node);
    },
    replaceNode(newDom, node){
        let $el = node.$el;
        $el.parentNode.replaceChild(newDom, $el);
        node.$el = newDom;
    }
};

export default render;