import Node from "./node";
import Watcher from "./watcher";
import Data from "./data";
import render from "./render";

class QV {
    constructor(opt = {}) {     // opt = {el: "app", template: "#t1", data: { … }}
        this.$data = Data.formatData(opt.data);
        // this.$data 大致的样子：
        // {
        //     ...
        //     o: {
        //         value: {
        //             text2: "普通对象求值"
        //         },
        //         linkNodes: [],
        //         mounted: false,
        //         _od_: {
        //             text2: {
        //                 value: "普通对象求值",
        //                 linkNodes: [],
        //                 mounted: false,
        //             }
        //         }
        //     }
        // }
        this.$root = new Node(opt);
        this.$watcher = new Watcher(this.$data);
        this.$watcher.linkNode(this.$root);

        // mount root
        render.mount(this.$root, this.$data);
    }
}

export  default QV;
