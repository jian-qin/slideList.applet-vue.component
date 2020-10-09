// components/slide-lists.js
Component({
    options: {
        multipleSlots: true // 启用多slot支持
    },
    /**
     * 组件的属性列表
     */
    properties: {
        height: { // 组件高度
            type: String,
            value: '100%'
        },
        list: { // 列表数据
            type: Array,
            value: []
        },
        scrollDisable: { // 是否禁用滚动加载更多
            type: Boolean,
            value: false
        },
        firstDisable: { // 是否禁用首屏加载2页
            type: Boolean,
            value: false
        },
        tolower: { // 从外部调用加载更多（设置初始0，上拉+1，监听变化；注意不能下拉刷新）
            type: Number,
            value: null,
            observer(n) {
                n && this.getList()
            }
        },
        reqFn: { // 请求函数
            type: Function,
            value: null,
            observer(f) {
                f && this.initialize()
            }
        },
        backSucc: { // 请求成功回调
            type: Function,
            value: null
        },
        backFail: { // 请求失败回调
            type: Function,
            value: null
        },
        offset: { // 滚动条与底部距离小于 offset 时触发加载事件
            type: Number,
            value: 300
        },
        dropDisable: { // 是否禁用下拉刷新
            type: Boolean,
            value: false
        },
        dropTipsDisable: { // 是否禁用下拉刷新成功提示
            type: Boolean,
            value: false
        },
        upColor: { // 颜色-上（刷新）
            type: String,
            value: 'gray'
        },
        dnColor: { // 颜色-下（加载提示）
            type: String,
            value: 'gray'
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        // 加载更多
        loadState: 0, // 加载状态 -1加载失败(首屏) 0无提示 1加载中 2没有更多 3无数据 4加载失败(更多)
        page: null, // 当前页码
        // 刷新
        dropRefresh: 70, // 边境距离-刷新
        dropSlow: 100, // 边境距离-减速
        dropMax: 110, // 边境距离-最大
        dropStep: 1, // 边境距离-步长
        dropOngoing: false, // 刷新状态
        turnAn: 0, // 刷新动画：0 无动画，1 转圈，2 转圈+缩小，3 隐藏
        // wxs通讯
        wxsVar: [], // 变量
    },

    /**
     * 生命周期函数--组件实例进入页面节点树
     */
    attached() {
        this.pxConv()
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // px换算适配设备
        pxConv() {
            let n = wx.getSystemInfoSync().screenWidth / 375
            this.setData({
                wxsVar: [
                    {
                        key: 'dropRefresh',
                        val: this.data.dropRefresh * n
                    },
                    {
                        key: 'dropSlow',
                        val: this.data.dropSlow * n
                    },
                    {
                        key: 'dropMax',
                        val: this.data.dropMax * n
                    },
                    {
                        key: 'dropStep',
                        val: 100 / (this.data.dropRefresh * n)
                    }
                ]
            })
        },
        // 初始化
        initialize() {
            this.setData({
                dropOngoing: false,
                loadState: 0,
                page: null
            })
            this.getList()
        },
        // 刷新列表数据
        refresh() {
            this.setData({
                dropOngoing: true,
                page: null,
                turnAn: 1,
                wxsVar: [{
                    key: 'dropCache',
                    val: 0
                }]
            })
            this.data.reqFn(p => this.data.page = p || 0).then(e => {
                this.data.backSucc(e, newList => newList)
                this.rotateAnEnd()
                this.data.dropTipsDisable || wx.showToast({
                    title: '刷新成功',
                    icon: 'none'
                })
                if (this.data.list.length > 0) {
                    ++this.data.page
                    this.setData({
                        loadState: 0
                    })
                    this.data.firstDisable || this.getList()
                } else {
                    this.setData({
                        loadState: 3
                    })
                }
            }).catch(er => {
                this.rotateAnEnd()
                this.data.backFail && this.data.backFail(er)
                wx.showToast({
                    title: '刷新失败',
                    icon: 'none'
                })
            })
        },
        // 刷新动画结束
        rotateAnEnd() {
            this.setData({
                dropOngoing: false,
                turnAn: 2
            })
            setTimeout(() => {
                this.setData({
                    turnAn: 3
                })
            }, 300)
        },
        // 下拉-判断是否可用（取反）
        dropSwitch() {
            return this.data.dropDisable || this.data.tolower !== null || this.data.dropOngoing || this.data.loadState == 1 || !this.data.reqFn || !this.data.backSucc
        },
        // 下拉-开始
        dropStart(e) {
            if (this.dropSwitch()) return
            this.setData({
                wxsVar: [{
                    key: 'dropCache',
                    val: e.touches[0].clientY
                }]
            })
        },
        // 加载列表数据
        getList() {
            if (this.data.scrollDisable || this.data.dropOngoing || !this.data.reqFn || !this.data.backSucc || this.data.loadState == 1 || this.data.loadState == 2 || this.data.loadState == 3) return
            this.setData({
                loadState: 1
            })
            let isOne = this.data.page === null
            this.data.reqFn(p => isOne ? (this.data.page = p || 0) : this.data.page).then(e => {
                let oldL = isOne ? 0 : this.data.list.length
                this.data.backSucc(e, newList => (isOne ? [] : this.data.list).concat(newList))
                if (this.data.list.length > oldL) {
                    ++this.data.page
                    this.setData({
                        loadState: 0
                    })
                    isOne && !this.data.firstDisable && this.getList()
                } else if (oldL) {
                    this.setData({
                        loadState: 2
                    })
                } else {
                    this.setData({
                        loadState: 3
                    })
                }
            }).catch(er => {
                this.setData({
                    loadState: isOne ? -1 : 4
                })
                this.data.backFail && this.data.backFail(er)
            })
        },
        // wxs通讯 - 设置变量
        jsVar(e) {
            this.setData(e)
        },
    }
})
