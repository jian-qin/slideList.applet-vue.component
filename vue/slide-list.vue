// 分页列表
<template>
    <div class="slide-_-list">
        <pull-refresh 
            :disabled='!isRefresh' 
            v-model='refresh' 
            success-text='刷新完成' 
            @refresh="++refreshCall" 
            style="height:100%;overflow-y:auto" 
            :class="noData ? 'noData' : ''" 
        >
            <list 
                v-model='load' 
                :finished='end' 
                :error.sync='err' 
                :loading-text='loadTxt' 
                :finished-text='endTxt' 
                :error-text='errorTxt' 
                :offset='offset' 
                :immediate-check='false' 
                @load='getList' 
            >
                <slot></slot>
                <slot name='noData'>
                    <div class="reserve" v-if="noData">无数据</div>
                </slot>
            </list>
        </pull-refresh>
        {{monitor_reqFn}}{{monitor_value}}
    </div>
</template>

<script>
import { List, PullRefresh } from 'vant'
export default {
    name: "slide-list",
    components: {
        List,
        PullRefresh
    },
    props: {
        value: { // 列表数据
            type: Array,
            default: () => []
        },
        reqFn: { // 请求函数
            type: Function,
            default: null
        },
        backSucc: { // 请求成功回调
            type: Function,
            default: () => () => {}
        },
        backFail: { // 请求失败回调
            type: Function,
            default: () => () => {}
        },
        loadTxt: { // 加载过程中的提示文案
            type: String,
            default: '加载中...'
        },
        endTxt: { // 加载完成后的提示文案
            type: String,
            default: '没有更多了'
        },
        errorTxt: { // 加载失败后的提示文案	
            type: String,
            default: '请求失败，点击重新加载'
        },
        offset: { // 滚动条与底部距离小于 offset 时触发加载事件
            type: Number,
            default: 300
        },
        isRefresh: { // 是否启用下拉刷新
            type: Boolean,
            default: true
        }
    },
    data: v => ({
        list_initial: null, // 列表数据_初始值
        list_than: null, // 列表数据_指针对比值
        page: null, // 页码
        load: false, // 请求状态
        end: false, // 加载完成
        err: false, // 加载失败
        noData: false, // 无数据
        refresh: false, // 刷新状态
        refreshCall: 0 // 监听刷新
    }),
    computed: {
        // 监听 reqFn 设置完成（必须在html中使用才能生效）
        monitor_reqFn() {
            if (typeof this.reqFn != 'function') return
            this.refreshCall // 监听 refreshCall 启动刷新
            this.initialize()
            return ''
        },
        // 监听 value 被父组件‘=’重置赋值，原理：比较指针是否相同（必须在html中使用才能生效）
        monitor_value() {
            if (this.value !== this.list_than) this.list_initial = JSON.parse(JSON.stringify(this.value))
            return ''
        }
    },
    methods: {
        // 初始化
        initialize() {
            this.page = null
            this.load = true
            this.end = false
            this.err = false
            this.noData = false
            this.$nextTick(this.getList) // $nextTick 隔绝对 计算属性 的影响
        },
        // 请求列表数据
        getList() {
            let isInitial = this.page === null
            this.reqFn(p => isInitial ? (this.page = p || 0) : this.page).then(e => {
                this.refresh = false
                let list = this.backSucc(e) || []
                if (list[0]) {
                    this.list_than = this[isInitial ? 'list_initial' : 'value'].concat(list)
                    this.$emit('input', this.list_than)
                    ++this.page
                } else {
                    this.end = true
                    if (!this.value[0]) this.noData = true
                }
                this.load = false
            }).catch(er => {
                this.refresh = false
                this.load = false
                this.err = true
                this.backFail(er)
            })
        }
    }
}
</script>

<style scoped>
.slide-_-list {
    height:100%;
    color:#999;
}
.slide-_-list /deep/ .van-pull-refresh__track {
    height: 100%;
}
.slide-_-list /deep/ .van-pull-refresh__head,
.slide-_-list /deep/ .van-loading,
.slide-_-list /deep/ .van-loading__text,
.slide-_-list /deep/ .van-list__loading,
.slide-_-list /deep/ .van-list__error-text,
.slide-_-list /deep/ .van-list__finished-text {
    color: inherit;
}
.noData /deep/ .van-list__finished-text {
    display: none;
}
/* 无数据提示（根据项目需求，设置默认的无数据提示） */
.reserve {
    text-align: center;
    line-height: 3rem;
}
</style>
