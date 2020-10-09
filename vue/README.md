# 分页列表

> 使用了ui框架vant的2个提示组件：Toast轻提示，Empty空状态（不是重要的东西懒得写）

## 快速上手

```html
<slide-lists v-model="list" :req-fn="reqFn" :back-succ="backSucc">
    <div v-for="item in list" :key="item.id"></div>
</slide-lists>
```

```js
data() {
    return {
        list: [], // 列表数据
        reqFn: null, // 请求函数
        backSucc: null // 请求成功回调
    }
},
methods: {
    // 初始化
    initial() {
        this.reqFn = fn => this.$ajax.post({ // 必须使用Promise封装ajax
            url: '', // 请求地址
            data: { // 请求传参
                page: fn(0), // 页码，从0开始
            }
        })
        this.backSucc = e => {
            let arr = e.data.arr // 当前请求的列表数据
            // 可以在这里处理arr
            return arr // 拼接上前面页码的数据（不要自己拼接）
        }
    },
}
```

## 更多插槽

```html
<slide-lists v-model="list" :req-fn="reqFn" :back-succ="backSucc">
    <!-- 更多 -->
    <template v-slot:other>这是列表上可滚动的内容</template>
    <!-- 列表 -->
    <div v-for="item in list" :key="item.id"></div>
</slide-lists>
```

## 多个分页列表

+ 小程序因为setData限制，无法实现多个分页列表

```html
<div ref="father">
    <div ref="child">
        <!-- 更多 -->
        <div>这是列表上可滚动的内容</div>
        <!-- 导航（粘性布局） -->
        <div>
            <div @click="seleNav == 1">列表1</div>
            <div @click="seleNav == 2">列表2</div>
        </div>
        <!-- 列表1 -->
        <slide-lists 
            v-model="list1" :req-fn="reqFn1" :back-succ="backSucc1" 
            ref-box="father" ref-con="child"
            :scroll-disable="seleNav != 1" :drop-disable="seleNav != 1"
        >
            <div v-for="item in list1" :key="item.id"></div>
        </slide-lists>
        <!-- 列表2 -->
        <slide-lists 
            v-model="list2" :req-fn="reqFn2" :back-succ="backSucc2" 
            ref-box="father" ref-con="child"
            :scroll-disable="seleNav != 2" :drop-disable="seleNav != 2"
        >
            <div v-for="item in list2" :key="item.id"></div>
        </slide-lists>
    </div>
</div>
```

### 原理

1. 点击导航切换显示分页列表

2. 多个分页列表共用页面中的ref滚动监听

3. 通过切换 scroll-disable是否禁用滚动加载更多、drop-disable是否禁用下拉刷新

4. 实现当前显示的分页列表使用 滚动加载更多 和 下拉刷新，而不影响到其他分页列表

### 使用场景

1. 有多个分页列表

2. 并且上方存在 其他可滚动的内容

3. 并且不希望切换导航栏时重置列表（1个分页列表，切换不同的req-fn请求函数）

## Props

| 属性 | 类型 | 默认值 | 必填 | 说明 |
| - | - | - | - | - |
| v-model | array | [] | 是 | 列表数据 |
| req-fn | function | null | 是 | 请求函数 |
| back-succ | function | null | 是 | 请求成功回调 |
| back-fail | function | null | 否 | 请求失败回调 |
| scroll-disable | boolean | false | 否 | 是否禁用滚动加载更多 |
| first-disable | boolean | false | 否 | 是否禁用首屏加载2页 |
| ref-box | string | null | 否 | 容器ref - 提供滚动事件 |
| ref-con | string | null | 否 | 内容ref - 提供滚动事件 |
| offset | number | 300 | 否 | 滚动条与底部距离小于 offset 时触发加载事件 |
| drop-disable | boolean | false | 否 | 是否禁用下拉刷新 |
| drop-tips-disable | boolean | false | 否 | 是否禁用下拉刷新成功提示 |
| up-color | string | gray | 否 | 颜色-上（刷新） |
| dn-color | string | gray | 否 | 颜色-下（加载提示） |