# 分页列表 1.2.0

> 简化了使用组件所需的代码量；
新版使用了 Promise 封装的 ajax，考虑一般来说都会封装 ajax，就不兼容原版的 ajax 请求方式了；
用原版 ajax 可以看看 1.0 版。

## 实例

### wxml：

```html
<slide-list reqFn='{{reqFn}}' backSucc='{{backSucc}}'>
    <view slot='list' wx:for=''>列表内容...</view>
    <view slot='noData'>暂无数据提示（不传显示默认提示）</view>
</slide-list>
```

### js：

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
            reqFn: fn => ajax.get('/apis/getGoodsList', {
                page: fn(0) // 设置初始页码，默认为 0
            }),
            backSucc: (e, fn) => {
                let arr = e.data.list
                // 在这里处理列表数据...
                fn(arr, (list, page, state) => {
                    console.log('列表内容:', list, '当前页码:', page, '当前加载状态:', state)
                    this.setData({ list })
                })
            }
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

## props

- reqFn 请求函数

- backSucc 请求成功回调

- backFail 请求失败回调

- sty 组件样式

- color 字体颜色 '#999'

- size 字体大小 '28rpx'

- loadTxt 加载过程中的提示文案 '加载中...'

- endTxt 加载完成后的提示文案 '没有更多了'

- errorTxt 加载失败后的提示文案	'请求失败，点击重新加载'

- offset 滚动条与底部距离小于 offset 时触发加载事件 300