// components/slide-list/slide-list.js
Component({
    options: {
        multipleSlots: true // 启用多slot支持
    },
    /**
     * 组件的属性列表
     */
    properties: {
        reqFn: { // 请求函数
            type: Function,
            value() {}
        },
        reqData: { // 请求参数
            type: Array,
            value: [],
            observer(e) {
                e[0] && this.initialize()
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
    },

    /**
     * 组件的初始数据
     */
    data: {
        list: [], // 列表数据
        page: { // 页码
            index: 1, // 请求对象下标
            key: 'page', // 页码key
            initial: 0, // 初始值
            value: 0, // 当前值
        },
        state: 0, // 状态：-1 隐藏，0 加载中，1 加载完成，2 加载失败
        isReq: true, // 请求状态
        refresh: false, // 下拉刷新状态：true 已触发，false 未触发
        triggerStaye: 0, // 触发下拉刷新状态：0 下拉，1 释放，2 加载
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // 初始化
        initialize() {
            let arr = this.data.reqData
            for (let i in arr) {
                if (typeof arr[i] == 'object') {
                    for (let k in arr[i]) {
                        if (!k.indexOf('__')) { // 查找‘页码标记’
                            let key = k.substring(2)
                            let val = arr[i][k]
                            delete arr[i][k]
                            arr[i][key] = val
                            this.data.page = {
                                index: i,
                                key,
                                initial: val,
                                value: val
                            }
                            this.data.list = []
                            this.getList()
                            return
                        }
                    }
                }
            }
            console.error('请先标记页码：‘__页码’')
        },
        // 请求列表数据
        getList() {
            if (!(this.data.isReq && (this.data.state == 0 || this.data.state == 2))) return
            this.data.isReq = false
            let page = this.data.page.value
            this.data.reqData[this.data.page.index][this.data.page.key] = page
            this.data.reqFn(...this.data.reqData).then(e => {
                this.data.isReq = true
                this.data.backSucc(e, (list = [], fn) => {
                    if (list[0]) {
                        this.data.list = this.data.list.concat(list)
                        ++this.data.page.value
                        this.setData({
                            state: 0
                        })
                    } else {
                        this.setData({
                            state: this.data.list[0] ? 1 : -1 // 暂无内容提示
                        })
                    }
                    fn(this.data.list, page, this.data.state)
                    list[0] && page == this.data.page.initial && this.getList() // 加载第2页
                })
            }).catch(er => {
                this.data.isReq = true
                this.setData({
                    state: 2
                })
                this.data.backFail(er, this.data.page.value, this.data.state)
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
            // 刷新列表
            this.data.isReq = false
            let page = this.data.page.initial
            this.data.reqData[this.data.page.index][this.data.page.key] = page
            this.data.reqFn(...this.data.reqData).then(e => {
                this.data.isReq = true
                this.data.backSucc(e, (list = [], fn) => {
                    this.data.list = list
                    if (list[0]) {
                        this.data.page.value = page + 1
                        this.setData({
                            state: 0,
                            refresh: false
                        })
                    } else {
                        this.setData({
                            state: -1, // 暂无内容提示
                            refresh: false
                        })
                    }
                    fn(list, page, this.data.state)
                    list[0] && this.getList() // 加载第2页
                })
            }).catch(er => {
                this.data.isReq = true
                this.setData({
                    state: 2,
                    refresh: false
                })
                this.data.backFail(er, this.data.page.value, this.data.state)
            })
        },
    }
})
