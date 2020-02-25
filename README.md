# 分页列表 1.1.0

## 改动：简化了使用组件的代码数量；这一版使用了 Promise 封装的 ajax，不能用可以去看看 1.0 版。

### wxml：

```html
<slide-list reqFn='{{reqFn}}' reqData='{{reqData}}' backSucc='{{backSucc}}'>
    <view slot='list'>列表内容...</view>
    <view slot='noData'>暂无数据提示（不传显示默认提示）</view>
</slide-list>
```

### js：

```javascript
const ajax = require('../../utils/ajax.js') // 使用 Promise 封装的 ajax 方法
Page({
    /**
    * 页面的初始数据
    */
    data: {
        reqFn: null, // 请求函数
        reqData: null, // 请求参数
        backSucc: null, // 请求成功回调
    },
    // 初始化
    initialize() {
        this.setData({
            reqFn: ajax.get,
            reqData: ['/apis/getGoodsList', {
                __page: 0 // *注意：必须在页码字段前加上‘__’作为标识，在请求时会自动去除‘__’
            }],
            backSucc: (e, fn) => {
                let arr = e.data.list
                // 在这里处理列表数据...
                fn(arr, (list, page, state) => {
                    console.log('列表内容：', list, '，当前页码：', page, '，当前加载状态：', state)
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