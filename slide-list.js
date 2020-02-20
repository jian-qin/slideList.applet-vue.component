// components/slide-list/slide-list.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        state: { // 状态：-1 隐藏，0 加载中，1 加载完成，2 加载失败
            type: Number,
            value: 0
        },
        isReq: { // 是否正在请求数据中
            type: Boolean,
            value: false
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
        refresh: { // 下拉刷新状态：'' 不开启，true 已触发，false 未触发
            type: [Boolean, String],
            value: ''
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
        triggerStaye: 0, // 触发下拉刷新状态：0 下拉，1 释放，2 加载
    },

    /**
     * 组件的方法列表
     */
    methods: {
        // 上拉加载更多
        scrolltolower() {
            if (!this.data.isReq && (this.data.state == 0 || this.data.state == 2)) {
                this.setData({
                    isReq: true
                })
                this.triggerEvent('tolower')
            }
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
            this.triggerEvent('refresher')
        },
    }
})
