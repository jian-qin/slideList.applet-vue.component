# 分页列表 1.3.0

> 简化了使用组件所需的代码量；
使用了 Promise 封装的 ajax，考虑一般来说都会封装 ajax，就不兼容原版的 ajax 请求方式了；
如果有使用原版 ajax 的需求，可以在 GitHub 上提 bug。

- GitHub：<https://github.com/jian-qin/slideList.applet-vue.component>



## 微信小程序

```html
<slide-list req-fn='{{reqFn}}' back-succ='{{backSucc}}'>
    <view slot='list' wx:for=''>列表内容...</view>
    <view slot='noData'>暂无数据提示（不传显示默认提示）</view>
</slide-list>
```

```javascript
const ajax = require('../../utils/ajax.js') // 使用 Promise 封装了 ajax 方法
Page({
    /**
    * 页面的初始数据
    */
    data: {
        reqFn: null, // 请求函数
        backSucc: null, // 请求成功回调
    },
    // 初始化
    initialize() {
        this.setData({
            reqFn: fn => ajax.get('/apis/getList', {
                page: fn(0) // 设置初始页码为 0（不传默认为 0）
            }),
            backSucc: (e, fn) => {
                console.log('列表数据', e)
                // 在这里处理列表数据...
                fn(e.data.list, (list, page, state) => {
                    console.log('列表内容:', list, '当前页码:', page, '当前加载状态:', state)
                    this.setData({ list })
                })
            }
        })
    },
    // list（深度同步列表数据）使用注意示例：
    listExample() {
        // 普通同步（可以不传 list 到组件）
        this.data.list.pop()
        this.setData({
            list: this.data.list // 更新值为 ‘原数组’
        })
        // 深度同步（必须传 list 到组件）
        let arr = this.data.list.concat([''])
        this.setData({
            list: arr // 更新值为 ‘新数组’
        })
    },
    /**
    * 生命周期函数--监听页面加载
    */
    onLoad: function () {
        this.initialize()
    },
})
```

### props

| 字段 | 默认值 | 说明 | 注意 |
| - | - | - | - |
| list | [] | 深度同步列表数据 | 深度同步指 更新值为新数组 |
| list-initial | [] | 初始列表数据 |
| req-fn | null | 请求函数 | 被‘=’重置赋值时，组件将 初始化参数 执行此函数 |
| back-succ | () => {} | 请求成功回调 |
| back-fail | () => {} | 请求失败回调 |
| sty | '' | 组件样式 | 高度不能为 auto |
| color | '#999' | 字体颜色 |
| size | '28rpx' | 字体大小 |
| load-txt | '加载中...' | 加载过程中的提示文案 |
| end-txt | '没有更多了' | 加载完成后的提示文案 |
| error-txt | '请求失败，点击重新加载' | 加载失败后的提示文案 |
| offset | 300 | 滚动条与底部距离小于 offset 时触发加载事件 |
| is-refresh | true | 是否启用下拉刷新 |
| reset-scroll | true | 是否启用重置滚动位置 |



## Vue

```html
<slide-list 
    v-model='list' :req-fn='reqFn' :back-succ='backSucc' // 基础参数（必传）
    style='height:100%;color:#999;background-color:white;' // 设置组件样式（默认 高100% 文字颜色#999）*注意：高度不能为 auto
    ref='list' // 标记（获取组件实例：操作 page页码、list_than列表数据_指针对比值）
>
    <div v-for=''>列表内容...</div>
    <template #noData>暂无数据提示（不传显示默认提示）</template>
</slide-list>
```

```javascript
export default {
    data: v => ({
        list: [], // 列表数据
        reqFn: null, // 请求函数（当 被‘=’重置赋值时，组件将 初始化参数 执行此函数）
        backSucc: null // 请求成功回调
    }),
    created() {
        this.getList()
    },
    methods: {
        // 获取列表数据
        getList() {
            this.reqFn = fn => this.$ajax.get('/apis/getList', {
                page: fn(0) // 设置初始页码为 0（不传默认为 0）
            })
            this.backSucc = e => {
                console.log('本次请求的页码:', this.$refs.list.page)
                console.log('列表数据', e)
                // 在此删改处理列表数据...
                return e.data.list
            }
        },
        // 干预 自动备份列表初始数据（list_than 列表数据_指针对比值）
        list_thanExample() {
            // 默认自动备份
            this.list.pop() // 操作 ‘原数组’ 没有触发备份
            this.list = this.list.concat(['']) // ‘原数组’ 被替换 触发备份
            // 禁止本次备份
            let newList = this.list.concat([''])
            this.$refs.list.list_than = newList // 手动同步 ‘列表数据_指针对比值’ 使本次备份失效
            this.list = newList
        }
    }
}
```

### props

| 字段 | 默认值 | 说明 | 注意 |
| - | - | - | - |
| v-model | [] | 列表数据 | 第1次传入 和 被‘=’重置赋值时，组件将备份为 初始列表数据 在下拉刷新时使用 |
| req-fn | null | 请求函数 | 被‘=’重置赋值时，组件将 初始化参数 执行此函数 |
| back-succ | () => {} | 请求成功回调 |
| back-fail | () => {} | 请求失败回调 |
| load-txt | '加载中...' | 加载过程中的提示文案 |
| end-txt | '没有更多了' | 加载完成后的提示文案 |
| error-txt | '请求失败，点击重新加载' | 加载失败后的提示文案 |
| offset | 300 | 滚动条与底部距离小于 offset 时触发加载事件 |
| is-refresh | true | 是否启用下拉刷新 |
| reset-scroll | true | 是否启用重置滚动位置 |
