import htmlParse from "./ast/parse";
import Render from "../core/render";
import compiler_helper from "./compiler-helper";

class Compiler {
    constructor(tpl) {
        this.$tpl = Render.generalDom(tpl);     // this.$tpl：在原始的模板字符串外包一层 div
        this.tpl = this.$tpl.outerHTML;         // this.tpl：仍旧是原始的模板字符串
        this.$ast = htmlParse(tpl);             // 将模板字符串生成为 ast
        // $ast：
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

        this.init(compiler_helper.generaltplFn(this.$ast[0]));  // 处理 ast 里的 dsl 属性，最终转成模板函数
    }

    init({tplFn, linkArgs}) {
        this.tplFn = tplFn;
        this.linkArgs = linkArgs;
    }
}

export default Compiler;
