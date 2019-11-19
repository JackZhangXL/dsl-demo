const compiler_helper = {
    formatParam(str){
        let $s = str.split(".");
        return JSON.stringify($s);
    },
    _c(tagName, attrs = {}, children = []){
        let $t = document.createElement(tagName);

        for (let key in attrs) {
            $t.setAttribute(key, attrs[key]);
        }

        let $valueSet = [];

        for (let i = 0, n; n = children[i]; i++) {
            $valueSet.push(n.value.wholeText);
            $t.appendChild(n.value);
        }

        $valueSet.push(tagName);

        return {
            type: "tag",
            value: $t
        };
    },
    getItemData(data, itemNameSet){
        if (itemNameSet.length === 1) {
            return data[itemNameSet[0]];
        } else {
            return this.getItemData(data[itemNameSet.shift()], itemNameSet);
        }
    },
    _i(data, itemName, renderIfFn){
        if (this.getItemData(data, itemName)) {
            return renderIfFn();
        } else {
            return {
                type: "fragment",
                value: document.createDocumentFragment()
            }
        }
    },
    _f(data, itemName, keyName, renderEachFn){
        let $t = document.createDocumentFragment();
        let $o = this.getItemData(data, itemName);

        for (let item in $o) {
            data[keyName] = $o[item];
            $t.appendChild(renderEachFn(data).value);
        }

        delete data[keyName];

        return {
            type: "fragment",
            value: $t
        };
    },
    _h(data, htmlItemName, tagName, attrs = {}){
        let $t = this._c(tagName, attrs).value;
        $t.innerHTML = this.getItemData(data, htmlItemName);
        return {
            type: "tag",
            value: $t
        }
    },
    _t(fn, data){
        let temp = fn(data);
        return {
            type: "text",
            value: document.createTextNode(temp)
        };
    },
    generaltplFn($ast){
        let linkArgs = [];
        let $temp = this.generalNode($ast, linkArgs),
            $tempFn = `with(that){return ${$temp}}`;
        let tplFn = new Function("that", `${$tempFn}`);

        return {
            tplFn: tplFn,
            linkArgs: linkArgs
        };
    },
    generalNode($node, linkArgs){
        // $node：
        // [{
        //     attrs: {},
        //     dsl: [],
        //     name: "div",
        //     type: "tag",
        //     voidElement: false,
        //     children: [
        //         {type: "text", content: "↵        ", parent: {…}, next: {…}}
        //         {type: "tag", name: "div", voidElement: false, attrs: {…}, children: Array(1), …}
        //         {type: "text", content: "↵        {{o.text2}}↵        ", parent: {…}, next: {…}}
        //         {type: "tag", name: "div", voidElement: false, attrs: {…}, children: Array(1), …}
        //         {type: "text", content: "↵        ", parent: {…}, next: {…}}
        //         {type: "tag", name: "div", voidElement: false, attrs: {…}, children: Array(1), …}
        //         {type: "text", content: "↵        ", parent: {…}, next: {…}}
        //         {type: "tag", name: "div", voidElement: false, attrs: {…}, children: Array(1), …}
        //         {type: "text", content: "↵    ", parent: {…}}
        //     ]
        // }]
        if ($node.dsl && $node.dsl.length) {    // dsl 优先级 if > for > html
            let dslIndex;
            if ((dslIndex = $node.dsl.indexOf("dsl-if")) !== -1) {
                // $node：
                // {
                //     attrs: {dsl-if: "isShow"}
                //     children: [{…}]
                //     dsl: ["dsl-if"]
                //     name: "div"
                //     parent: {type: "tag", name: "div", voidElement: false, attrs: {…}, children: Array(9), …}
                //     prev: {type: "text", content: "        {{o.text2}}        ", parent: {…}, next: {…}}
                //     type: "tag"
                //     voidElement: false
                // }
                let itemName = $node.attrs["dsl-if"];
                linkArgs.push(itemName);

                $node.dsl.splice(dslIndex, 1);
                delete $node.attrs["dsl-if"];

                // 调用 renderIfFn 方法
                return `_i(data,${this.formatParam(itemName)},function(){
                    return ${this.generalNode($node, linkArgs)} 
                })`
            } else if ((dslIndex = $node.dsl.indexOf("dsl-for")) !== -1) {
                // $node：
                // {
                //     attrs: {dsl-for: "item in array1"}
                //     children: [{…}]
                //     dsl: ["dsl-for"]
                //     name: "div"
                //     parent: {type: "tag", name: "div", voidElement: false, attrs: {…}, children: Array(9), …}
                //     prev: {type: "text", content: "        ", parent: {…}, next: {…}}
                //     type: "tag"
                //     voidElement: false
                // }
                let reg = /([\w\W]+) in ([\w\W]+)/,
                    result = $node.attrs["dsl-for"].match(reg);

                linkArgs.push(result[2]);

                $node.dsl.splice(dslIndex, 1);
                delete $node.attrs["dsl-for"];

                return `_f(data,${this.formatParam(result[2])},'${result[1]}',function(data){
                    return ${this.generalNode($node, linkArgs)} ;
                })`
            } else if ((dslIndex = $node.dsl.indexOf("dsl-html")) !== -1) {
                // $node：
                // {
                //     attrs: {dsl-html: "htmlTemplate"}
                //     children: [{…}]
                //     dsl: ["dsl-html"]
                //     name: "div"
                //     parent: {type: "tag", name: "div", voidElement: false, attrs: {…}, children: Array(9), …}
                //     prev: {type: "text", content: "        ", parent: {…}, next: {…}}
                //     type: "tag"
                //     voidElement: false
                // }
                let itemName = $node.attrs["dsl-html"]; //有 html 模板的时候，忽略其中的节点，因为会被替换

                linkArgs.push(itemName);

                $node.dsl.splice(dslIndex, 1);
                delete $node.attrs["dsl-html"];

                return `_h(data,${this.formatParam(itemName)},'${$node.name}', ${JSON.stringify($node.attrs)})`;
            }
        } else if ($node.type === "tag") {  // 没有 dsl，是标签的话，就继续递归
            return `_c('${$node.name}', ${JSON.stringify($node.attrs)},[${$node.children.map(item => {
                return this.generalNode(item, linkArgs)
            })}])`;
        } else if ($node.type === "text") {
            $node.content = $node.content.replace(/\n/g, "");
            let text = $node.content.trim();

            let patt = /{{[ \t]*([\w\W]*?)[ \t]*}}/g;

            let result = "",
                temp = "",
                cursor = 0;

            while ((result = patt.exec(text)) !== null) {
                let $temp1 = text.slice(cursor, result.index); //模板前面
                cursor += $temp1.length;
                temp += this.wrapStaticBlock($temp1);
                temp += this.wrapDynamicBlock(result);
                linkArgs.push(result[1]);
                cursor += result[0].length;
            }

            temp += this.wrapStaticBlock(text.slice(cursor, text.length));

            let fn = this.gTplFn(temp);

            return `_t(${fn.toString()},data)`
        }
    },
    wrapStaticBlock(str) {
        return "\'" + str + "\'";
    },
    wrapDynamicBlock (result) {
        return " + data." + result[1] + " + "
    },
    gTplFn: function (str) {
        let $t = " return " + str;
        $t = $t.replace(/\n/g, "");
        return new Function("data", $t);
    }
};

export default compiler_helper;
