// 分页列表（模仿的b站app）
<template>
    <div 
        class="slide-_-lists"
        :style="{
            fontSize: em + 'px',
            overflowY: refBox && refCon ? '' : (dropTop ? 'hidden' : 'auto')
        }" 
        ref="slidelist" 
        @scroll.passive="scrollLoad" 
        @touchstart.passive="dropStart" 
        @touchmove.passive="dropMove" 
        @touchend.passive="dropEnd"
    >
        <div ref="slidelistcon">
            <!-- 其他 -->
            <slot name="other"></slot>
            <!-- 刷新&首屏加载 -->
            <div class="refresh">
                <div>
                    <div :style="`box-shadow:0 0 .06rem ${upColor};top:${dropTop}px;transform:scale(${isZoom})`">
                        <div :style="`opacity:${dropTop >= dropRefresh ? '1' : '.4'}`">
                            <div :style="`border:solid .04rem ${upColor};${dropOngoing ? turnAn : clipFan(dropTop > dropRefresh ? dropTop * dropStep + 20 : dropTop * dropStep / 5, dropTop * dropStep)}`"></div>
                            <p v-show="!dropOngoing" :style="`background-color:${upColor};transform:rotate(${dropTop * dropStep * 3.6}deg)`"></p>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 列表 -->
            <slot></slot>
        </div>
        <!-- 加载状态提示 -->
        <div class="loadState" :style="'color:' + dnColor">
            <!-- 加载失败(首屏) -->
            <slot name="errtips" v-if="loadState == -1">
                <empty image="error" description="加载出错" />
            </slot>
            <!-- 加载中 -->
            <div class="loadState-item loadState-item_load" v-else-if="loadState == 1">
                <div :style="`border:solid .02em ${dnColor};${turnAn}`"></div>
                <p>加载中...</p>
            </div>
            <!-- 没有更多 -->
            <div class="loadState-item" v-else-if="loadState == 2">
                <p>没有更多了</p>
            </div>
            <!-- 无数据 -->
            <slot name="notips" v-else-if="loadState == 3">
                <empty description="暂无数据" />
            </slot>
            <!-- 加载失败(更多) -->
            <div class="loadState-item" v-else-if="loadState == 4" @click="getList">
                <p>请求失败，点击重试</p>
            </div>
        </div>
        <!-- 只为了计算属性能生效 -->
        {{monitor_reqFn}}
    </div>
</template>

<script>
import { Toast, Empty } from 'vant' // 这2个提示类的组件就懒得写了
export default {
    name: "slide-lists",
    components: {
        Empty // 空状态
    },
    props: {
        value: { // 列表数据
            type: Array,
            default: () => []
        },
        scrollDisable: { // 是否禁用滚动加载更多
            type: Boolean,
            default: false
        },
        firstDisable: { // 是否禁用首屏加载2页
            type: Boolean,
            default: false
        },
        reqFn: { // 请求函数
            type: Function,
            default: null
        },
        backSucc: { // 请求成功回调
            type: Function,
            default: null
        },
        backFail: { // 请求失败回调
            type: Function,
            default: null
        },
        refBox: { // 容器ref - 提供滚动事件
            type: String,
            default: null
        },
        refCon: { // 内容ref - 提供滚动事件
            type: String,
            default: null
        },
        offset: { // 滚动条与底部距离小于 offset 时触发加载事件
            type: Number,
            default: 300
        },
        dropDisable: { // 是否禁用下拉刷新
            type: Boolean,
            default: false
        },
        dropTipsDisable: { // 是否禁用下拉刷新成功提示
            type: Boolean,
            default: false
        },
        upColor: { // 颜色-上（刷新）
            type: String,
            default: 'gray'
        },
        dnColor: { // 颜色-下（加载提示）
            type: String,
            default: 'gray'
        },
    },
    data: vm => ({
        em: document.documentElement.clientWidth / 7.5, // 根标签em
        // 转圈
        turnAn: 'clip-path:polygon(50% 50%,130.902% -8.77853%,150% -50%,150% 150%,-50% 150%,-50% -50%,150% -50%,50% -50%)', // 转圈动画，默认从(15, 0)开始
        turnAnId: null, // 动画定时器id
        // 刷新
        dropRefresh: 70, // 边境距离-刷新
        dropSlow: 100, // 边境距离-减速
        dropMax: 110, // 边境距离-最大
        dropCache: 0, // 缓存触摸坐标
        upDropCache: true, // 更新缓存触摸坐标
        dropTop: 0, // 刷新图标位置
        dropStep: 1, // 边境距离-步长
        isZoom: 0, // 刷新缩小动画
        dropOngoing: false, // 刷新状态
        boxDom: null, // 容器dom - 下拉禁止滚动事件
        // 加载更多
        scrollTop: 0, // 滚动距离
        scrollH: 0, // 滚动高度
        loadState: 0, // 加载状态 -1加载失败(首屏) 0无提示 1加载中 2没有更多 3无数据 4加载失败(更多)
        page: null, // 当前页码
    }),
    computed: {
        // 监听 reqFn 设置完成（必须在html中使用才能生效）
        monitor_reqFn() {
            if (this.reqFn && !this.reqFn.slide_list__initialize) {
                this.reqFn.slide_list__initialize = true
                this.initialize()
            }
            return
        },
    },
    created() { /* 生命周期-组件创建 */
        this.resizeEm()
    },
    activated() { /* 生命周期-组件激活 */

    },
    mounted() { /* 生命周期-组件渲染 */
        this.pxConv()
        this.setScrollFn()
    },
    methods: {
        // em大小适应页面窗口变化
        resizeEm() {
            window.addEventListener('resize', () => {
                this.em = document.documentElement.clientWidth / 7.5
            }, false)
        },
        // px换算适配设备
        pxConv() {
            let n = document.body.clientWidth / 375
            this.dropRefresh *= n
            this.dropSlow *= n
            this.dropMax *= n
            this.dropStep = 100 / this.dropRefresh
        },
        // 下拉-判断是否可用（取反）
        dropSwitch() {
            return this.dropDisable || this.dropOngoing || this.loadState == 1 || !this.reqFn || !this.backSucc
        },
        // 下拉-开始
        dropStart(e) {
            if (this.dropSwitch()) return
            this.dropCache = e.touches[0].clientY
        },
        // 下拉-进行中
        dropMove(e) {
            if (this.dropSwitch()) return
            if (!this.scrollTop || this.dropTop) {
                if (this.upDropCache && !this.scrollTop) { // 更新缓存触摸坐标
                    this.upDropCache = false
                    this.dropCache = e.touches[0].clientY
                }
                let y = e.touches[0].clientY - this.dropCache
                if (y > 0) {
                    let dropTop = y
                    if (y > this.dropSlow) dropTop = this.dropSlow + (y - this.dropSlow) / 6 // 减速
                    this.dropTop = dropTop > this.dropMax ? this.dropMax : dropTop
                } else {
                    this.dropTop = 0
                }
                if (this.boxDom) this.boxDom.style.overflowY = this.dropTop ? 'hidden' : 'auto' // 下拉禁止组件外滚动事件
            }
        },
        // 下拉-结束
        dropEnd() {
            if (this.dropSwitch()) return
            this.upDropCache = true
            if (this.dropTop >= this.dropRefresh) { // 刷新
                this.dropTopAnimation(this.dropRefresh, this.refreshList)
            } else { // 取消刷新
                this.dropTopAnimation(0)
            }
        },
        // 位移动画
        dropTopAnimation(y, fn) {
            let n = (this.dropTop - y) / 12
            let top = 0
            let tid = setInterval(() => {
                top = this.dropTop - n
                if (top > y) {
                    this.dropTop = top
                } else {
                    this.dropTop = y
                    clearInterval(tid)
                    fn && fn()
                    if (this.boxDom) this.boxDom.style.overflowY = 'auto' // 下拉禁止组件外滚动事件
                }
            }, 16)
        },
        // 转圈动画
        turnAnimation(isTurn) {
            if (isTurn) {
                // 默认从第一阶段(15, 0)开始
                let time = 0 // 当前动画阶段时间
                let frameS = 15 // 当前帧-开始位置
                let frameE = 0 // 当前帧-终点位置
                let stage = 1 // 4个动画阶段
                this.turnAnId = setInterval(() => {
                    if (time == 25) { // 到达下一阶段
                        time = 0
                        stage = stage == 4 ? 1 : stage + 1
                    } else {
                        ++time
                    }
                    switch (stage) {
                        case 1:
                            this.turnAn = this.clipFan(frameS += 1, frameE += 1)
                            break
                        case 2:
                            this.turnAn = this.clipFan(frameS += 4, frameE += 1)
                            break
                        case 3:
                            this.turnAn = this.clipFan(frameS += 1, frameE += 1)
                            break
                        default:
                            this.turnAn = this.clipFan(frameS += 1, frameE += 4)
                    }
                }, 16)
            } else {
                clearInterval(this.turnAnId)
            }
        },
        // 刷新动画
        refreshAnimation(isRefresh) {
            this.turnAnimation(isRefresh)
            this.dropOngoing = isRefresh
            if (!isRefresh) { // 转圈缩小隐藏动画
                this.isZoom = 0
                setTimeout(() => {
                    this.dropTop = 0
                    this.isZoom = 1
                }, 300)
            }
        },
        // 加载列表数据-刷新
        refreshList() {
            this.refreshAnimation(true)
            this.reqFn(p => this.page = p || 0).then(e => {
                this.refreshAnimation()
                let list = this.backSucc(e) || []
                this.$emit('input', list)
                if (list.length) {
                    ++this.page
                    this.loadState = 0
                    this.firstDisable || this.getList()
                } else {
                    this.loadState = 3
                }
                this.dropTipsDisable || Toast('刷新成功')
            }).catch(er => {
                this.refreshAnimation()
                Toast.fail('刷新失败')
                this.backFail && this.backFail(er)
            })
        },

        // 确定是否使用组件外滚动
        setScrollFn() {
            let box = this.$refs.slidelist
            let con = this.$refs.slidelistcon
            if (this.refBox && this.refCon) {
                const findRef = name => { // 寻找ref位置
                    let superior = this.$parent
                    for (let i = 0; i < 10; i++) {
                        if (superior.$refs[name]) {
                            return superior.$refs[name]
                        } else if (superior.$parent) {
                            superior = superior.$parent
                        } else {
                            return
                        }
                    }
                }
                box = findRef(this.refBox)
                con = findRef(this.refCon)
                if (!box || !con) return
                box.addEventListener('scroll', this.scrollLoad, false)
                this.boxDom = box
            }
            this.scrollH = con.clientHeight - box.clientHeight
        },
        // 滚动加载
        scrollLoad(e) {
            this.scrollTop = e.target.scrollTop
            this.scrollH - this.scrollTop < this.offset && this.getList()
        },
        // 初始化组件状态
        initialize() {
            this.dropOngoing = false
            this.loadState = 0
            this.page = null
            this.turnAnimation()
            this.oneGetList()
        },
        // 首屏加载动画
        firstScreenAnimation(isState) {
            this.dropOngoing = isState
            if (isState) {
                this.dropTop = this.dropRefresh
                this.isZoom = 1
                this.turnAnimation(true)
            } else {
                this.isZoom = 0
                this.turnAnimation()
                setTimeout(() => {
                    this.dropTop = 0
                    this.isZoom = 1
                }, 300)
            }
        },
        // 加载列表数据-首屏
        oneGetList() {
            this.firstScreenAnimation(true)
            this.reqFn(p => this.page = p || 0).then(e => {
                this.firstScreenAnimation()
                let list = this.backSucc(e) || []
                this.$emit('input', list)
                if (list.length) {
                    ++this.page
                    this.firstDisable || this.getList()
                } else {
                    this.loadState = 3
                }
            }).catch(er => {
                this.firstScreenAnimation()
                this.loadState = -1
                this.backFail && this.backFail(er)
            })
        },
        // 加载列表数据-更多
        getList() {
            if (this.scrollDisable || this.dropOngoing || !this.reqFn || !this.backSucc || this.loadState == 1 || this.loadState == 2 || this.loadState == 3) return
            this.loadState = 1
            this.turnAnimation(true)
            this.reqFn(p => this.page).then(e => {
                this.turnAnimation()
                let list = this.backSucc(e) || []
                this.$emit('input', [...this.value, ...list])
                if (list.length) {
                    ++this.page
                    this.loadState = 0
                } else if (this.value.length) {
                    this.loadState = 2
                } else {
                    this.loadState = 3
                }
            }).catch(er => {
                this.turnAnimation()
                this.loadState = 4
                this.backFail && this.backFail(er)
            })
        },

        // 设置扇形
        clipFan(s, e) {
            // 起点和终点默认为 0
            if (e === undefined) {
                e = s || 0
                s = 0
            }
            // 起点和终点相同时不用计算，直接隐藏
            if (s == e) return 'clip-path:polygon(0% 0%)'
            // 取余100：让 100 == 0，120 == 20
            s %= 100
            e %= 100
            // 单位转换：100% == 360度
            s *= 3.6 // 起点角度
            e *= 3.6 // 终点角度
            let pn = Math.PI / 180
            // 减 90度 设置为从 12点钟方向 为 0% 的坐标
            let so = (s - 90) * pn // 起点角度
            let eo = (e - 90) * pn // 终点角度
            // 圆上任一点坐标 x：(圆点坐标x) + (圆半径r) * cos( (角度ao) * (π3.14) / 180 )
            // 圆上任一点坐标 y：(圆点坐标y) + (圆半径r) * sin( (角度ao) * (π3.14) / 180 )
            // 默认圆点坐标 (50,50)，意思为 (50%,50%)
            // 设置坐标到2倍圆上，可以减少坐标数量
            let sx = 50 + 100 * Math.cos(so) // 起点坐标x
            let sy = 50 + 100 * Math.sin(so) // 起点坐标y
            let ex = 50 + 100 * Math.cos(eo) // 终点坐标x
            let ey = 50 + 100 * Math.sin(eo) // 终点坐标y
            // 计算起点到终点之间的坐标
            let kn = `50% 50%,${sx}% ${sy}%` // 原点坐标->起点坐标
            let kArr = ['150% -50%', '150% 150%', '-50% 150%', '-50% -50%'] // 圆外正方形的4个顶点坐标（保险起见用1.5倍坐标）
            let sua = ~~(s / 90) // 起点所属象限
            let eua = ~~(e / 90) // 终点所属象限
            if (sua == eua && e > s) { // 起点和终点在同一象限，并且 终点角度 大于 起点角度
                kn += `,${kArr[sua]},${ex}% ${ey}%`
            } else { // 加上起点到终点经过的 圆外正方形的顶点坐标
                let isfor = true
                do {
                    kn += `,${kArr[sua]}`
                    sua = sua == 3 ? 0 : sua + 1
                    if (sua == eua) {
                        kn += `,${kArr[sua]},${ex}% ${ey}%`
                        isfor = false
                    }
                } while (isfor)
            }
            return `clip-path:polygon(${kn})`
        },
    },
}
</script>

<style scoped>
.slide-_-lists{
    height: 100%;
}
/* 刷新 */
.refresh{
    pointer-events: none;
    position: relative;
    z-index: 999;
}
.refresh>div{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 2.2em;
    overflow: hidden;
}
.refresh>div>div{
    position: absolute;
    left: calc(50% - .35em);
    top: 0;
    margin-top: -.74em;
    width: .7em;
    height: .7em;
    border-radius: 50%;
    background-color: white;
    transition: transform .3s;
}
.refresh>div>div>div{
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    transition: opacity .3s;
}
.refresh>div>div>div>div{
    width: .3em;
    height: .3em;
    border-radius: 50%;
}
.refresh>div>div>div>p{
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    clip-path: polygon(.35em .10em, .35em .26em, .44em .19em);
}
/* 加载状态提示 */
.loadState-item{
    line-height: 1em;
    text-align: center;
}
.loadState-item>p{
    font-size: .28em;
}
.loadState-item_load{
    display: flex;
    align-items: center;
    justify-content: center;
}
.loadState-item_load>div{
    width: .26em;
    height: .26em;
    border-radius: 50%;
    margin-right: .2em;
}
.loadState /deep/ .van-empty__description{
    color: inherit;
}
</style>
