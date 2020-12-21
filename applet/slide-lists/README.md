# 分页列表

> 因为小程序wxs限制，只有普通转圈动画

> 因为小程序setData限制，无法实现多个分页列表

## 快速上手

```wxml
<slide-lists list="{{list}}" req-fn="{{reqFn}}" back-succ="{{backSucc}}">
    <view wx:for="{{list}}" wx:key="id"></view>
</slide-lists>
```

```js
data: {
    list: [], // 列表数据
    reqFn: null, // 请求函数
    backSucc: null // 请求成功回调
},
// 初始化
initial() {
    this.setData({
        reqFn: fn => $ajax.post({ // 必须使用Promise封装ajax
            url: ", // 请求地址
            data: { // 请求传参
                page: fn(0), // 页码，从0开始
            }
        }),
        backSucc: (e, fn) => {
            let arr = e.data.arr // 当前请求的列表数据
            // 可以在这里处理arr
            this.setData({
                list: fn(arr) // 拼接上前面页码的数据（不要自己拼接）
            })
        }
    })
},
```

## 更多插槽

```wxml
<slide-lists list="{{list}}" req-fn="{{reqFn}}" back-succ="{{backSucc}}">
    <!-- 更多 -->
    <view slot="other">这是列表上可滚动的内容</view>
    <!-- 列表 -->
    <view wx:for="{{list}}" wx:key="id"></view>
</slide-lists>
```

## 更新列表中指定的项

```wxml
<slide-lists updata="{{updata}}" ...
```

```js
data: {
    updata: null, // 要更新项的下标
    ...
},
// 点赞
praise(e) {
    const i = e.currentTarget.dataset.i // i：点赞项的下标
    ...
    // 接口调用成功
    this.setData({
        updata: i
    })
},
```

## Props

| 属性 | 类型 | 默认值 | 必填 | 说明 |
| - | - | - | - | - |
| list | array | [] | 是 | 列表数据 |
| req-fn | function | null | 是 | 请求函数 |
| back-succ | function | null | 是 | 请求成功回调 |
| back-fail | function | null | 否 | 请求失败回调 |
| height | string | 100% | 否 | 组件高度 |
| updata | number | null | 否 | 更新列表中指定的项的下标 |
| tolower | number | null | 否 | 从外部调用加载更多（设置初始0，上拉+1，监听变化；注意不能下拉刷新） |
| scroll-disable | boolean | false | 否 | 是否禁用滚动加载更多 |
| first-disable | boolean | false | 否 | 是否禁用首屏加载2页 |
| offset | number | 300 | 否 | 滚动条与底部距离小于 offset 时触发加载事件 |
| drop-disable | boolean | false | 否 | 是否禁用下拉刷新 |
| drop-tips-disable | boolean | false | 否 | 是否禁用下拉刷新成功提示 |
| up-color | string | gray | 否 | 颜色-上（刷新） |
| dn-color | string | gray | 否 | 颜色-下（加载提示） |