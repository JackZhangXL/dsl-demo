import common from "../common/common";

const helper = {
    insertOD($targetData, $data){
        !$targetData && ($targetData = {});
        // 原始 $data 如下：
        // {
        //     array1: (3) ["循环显示1", "循环显示2", "循环显示3"],
        //     htmlTemplate: "<span style='color: blue'>这是段内联html</span>",
        //     isShow: true,
        //     o: {text2: "普通对象求值"},
        //     text1: "普通字符串求值",
        //     text3: "这是条件显示"
        // }
        for (let key in $data) {
            let type = common.checkType($data[key]);
            if (type === "Object") {
                // 例如 key = "o" 是对象，就递归 format 成：
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
                let $tempTargetData = {};
                this.insertOD($tempTargetData, $data[key]);
                $targetData[key] = {
                    value: $data[key],
                    linkNodes: [],
                    mounted: false,
                    _od_: $tempTargetData
                }
            } else {
                // 例如 key = "text1" 不是对象，就 format 成：
                // {
                //     ...
                //     text1: {
                //         value: "普通字符串求值",
                //         linkNodes: [],
                //         mounted: false,
                //     }
                // }
                $targetData[key] = {
                    value: $data[key],
                    linkNodes: [],
                    mounted: false
                }
            }
        }
        return $targetData;
    }
};

class Data {
    static formatData(data = {}) {
        data["_od_"] = helper.insertOD(data["_od_"], data);
        return data;
    }
}

export default Data;
