# 分页列表 1.0

## 效果还不错，就是代码有点多。

### wxml：

```html
<slide-list state='{{state}}' isReq='{{isReq}}' bind:tolower='getList' refresh='{{refresh}}' bind:refresher='refreshList'>
    列表内容...
    <view wx:if='{{state == -1}}'>暂无内容提示</view>
</slide-list>
```

### js：

```javascript
Page({
    /**
    * 页面的初始数据
    */
    data: {
        page: 0, // 页码
        list: [], // 列表
        state: 0, // 加载状态
        isReq: false, // 请求状态
        refresh: false, // 下拉刷新状态
    },
    // 获取列表
    getList() {
        调用接口...({
            page: this.data.page
        }).then(e => {
            let list = e.data.list
            if (list[0]) {
                this.setData({
                    list: this.data.list.concat(list),
                    page: this.data.page + 1,
                    isReq: false,
                    state: 0,
                })
                this.data.page == 1 && this.getList() // 加载第2页
            } else {
                this.setData({
                    isReq: false,
                    // state: 1,
                    state: this.data.list[0] ? 1 : -1, // 暂无内容提示
                })
            }
        }).catch(er => {
            this.setData({
                isReq: false,
                state: 2,
            })
        })
    },
    // 刷新列表
    refreshList() {
        调用接口...({
            page: 0
        }).then(e => {
            let list = e.data.list
            if (list[0]) {
                this.setData({
                    list,
                    page: 1,
                    refresh: false,
                    state: 0,
                })
                this.getList() // 加载第2页
            } else {
                this.setData({
                    list: [],
                    refresh: false,
                    // state: 1,
                    state: -1, // 暂无内容提示
                })
            }
        }).catch(er => {
            this.setData({
                refresh: false,
                state: 2,
            })
        })
    },
    /**
    * 生命周期函数--监听页面加载
    */
    onLoad: function () {
        this.getList()
    },
})
```