import Compiler from "../compiler/compiler-v2";
import Render  from "./render";
import EventLoop from "./event-loop";

class Node {
    constructor({el, template, data}) {     // opt = {el: "app", template: "#t1", data: { … }}
        this.$el = document.querySelector(el);
        let temp = document.querySelector(template);
        if (temp) {
            this.$template = temp.innerHTML.trim();
            // this.$template 值为：
            //     "<div>
            //         <div style="color: red">{{text1}}</div>
            //         {{o.text2}}
            //         <div dsl-if="isShow">{{text3}}</div>
            //         <div dsl-for="item in array1" dsl-if="isShow">
            //             {{item}}
            //         </div>
            //         <div dsl-html="htmlTemplate">不会显示这句话</div>
            //     </div>"
        }
        this.$data = data;

        this.$compiler = new Compiler(this.$template);  // 将模板字符串生成为 ast
        this.$args = this.$compiler.linkArgs; // ["text1", "o.text2", "isShow", "text3", "isShow", "array1", "item", "htmlTemplate"]
        this.$tplfn = this.$compiler.tplFn;
    }

    update() {
        EventLoop.d_o(Render.mount.bind(Render, this, this.$data));
    }
}

export default Node;
