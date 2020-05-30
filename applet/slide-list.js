// components/slide-list/slide-list.js

// 判断版本号
const compareVersion = (v1, v2) => {
    v1 = v1.split('.')
    v2 = v2.split('.')
    const len = Math.max(v1.length, v2.length)
    while (v1.length < len) {
        v1.push('0')
    }
    while (v2.length < len) {
        v2.push('0')
    }
    for (let i = 0; i < len; i++) {
        const num1 = parseInt(v1[i])
        const num2 = parseInt(v2[i])
        if (num1 > num2) {
            return 1
        } else if (num1 < num2) {
            return -1
        }
    }
    return 0
}

// 判断版本是否 >= 2.10.1
const canRefresh = compareVersion(wx.getSystemInfoSync().SDKVersion, '2.10.1') != -1

// 生成默认 data，用于初始化 data
const createData = () => JSON.parse(`{
    "page": null, ${''/* 页码 */}
    "scroll": 0, ${''/* 滚动条位置 */}
    "state": 0, ${''/* 状态：-1 隐藏，0 加载中，1 加载完成，2 加载失败 */}
    "isReq": true, ${''/* 请求状态 */}
    "canRefresh": ${canRefresh}, ${''/* 版本是否支持下拉刷新 */}
    "refresh": false, ${''/* 下拉刷新状态：true 已触发，false 未触发 */}
    "triggerStaye": 0 ${''/* 触发下拉刷新状态：0 下拉，1 释放，2 加载 */}
}`)

Component({
    options: {
        multipleSlots: true // 启用多slot支持
    },
    /**
     * 组件的属性列表
     */
    properties: {
        list: { // 列表数据_当前值
            type: Array,
            value: []
        },
        listInitial: { // 列表数据_初始值
            type: Array,
            value: []
        },
        reqFn: { // 请求函数
            type: Function,
            value: null,
            observer(e) {
                if (typeof e != 'function') return
                this.setData(createData())
                this.getList()
            }
        },
        backSucc: { // 请求成功回调
            type: Function,
            value() {}
        },
        backFail: { // 请求失败回调
            type: Function,
            value() {}
        },
        sty: { // 组件样式
            type: String,
            value: ''
        },
        color: { // 字体颜色
            type: String,
            value: '#999'
        },
        size: { // 字体大小
            type: String,
            value: '28rpx'
        },
        loadTxt: { // 加载过程中的提示文案
            type: String,
            value: '加载中...'
        },
        endTxt: { // 加载完成后的提示文案
            type: String,
            value: '没有更多了'
        },
        errorTxt: { // 加载失败后的提示文案	
            type: String,
            value: '请求失败，点击重新加载'
        },
        offset: { // 滚动条与底部距离小于 offset 时触发加载事件
            type: Number,
            value: 300
        },
        isRefresh: { // 是否启用下拉刷新
            type: Boolean,
            value: true
        },
        resetScroll: { // 是否启用重置滚动位置
            type: Boolean,
            value: true
        }
    },

    /**
     * 组件的初始数据
     */
    data: createData(),

    /**
     * 组件的方法列表
     */
    methods: {
        // 请求列表数据
        getList() {
            if (!(this.data.isReq && (this.data.state == 0 || this.data.state == 2))) return
            this.data.isReq = false
            let isInitial = this.data.page === null
            this.data.reqFn(p => isInitial ? (this.data.page = p || 0) : this.data.page).then(e => {
                this.data.isReq = true
                this.data.backSucc(e, (list, fn) => {
                    if (!list) list = []
                    this.data.list = this.data[isInitial ? 'listInitial' : 'list'].concat(list)
                    let page = this.data.page
                    if (list[0]) {
                        ++this.data.page
                        this.setData({
                            state: 0,
                            refresh: false
                        })
                    } else {
                        this.setData({
                            state: this.data.list[0] ? 1 : -1, // 暂无内容提示
                            refresh: false
                        })
                    }
                    fn(this.data.list, page, this.data.state)
                    isInitial && list[0] && this.getList() // 加载第2页
                })
            }).catch(er => {
                this.data.isReq = true
                this.setData({
                    state: 2,
                    refresh: false
                })
                this.data.backFail(er, this.data.page, this.data.state)
            })
        },
        // 自定义下拉刷新控件被下拉
        refresherpulling(e) {
            let state = Math.min(e.detail.dy / 50, 1) == 1
            if (this.data.triggerStaye != 0 && !state) { // 下拉
                this.setData({
                    triggerStaye: 0
                })
            } else if (this.data.triggerStaye != 1 && state) { // 释放
                this.setData({
                    triggerStaye: 1
                })
            }
        },
        // 自定义下拉刷新被触发
        refresherrefresh() {
            this.setData({
                triggerStaye: 2
            })
            this.data.page = null
            this.data.state = 0
            this.data.isReq = true
            this.getList()
        }
    }
})
