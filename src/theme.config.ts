// @ts-ignore
// @ts-ignore
export const THEME_CONFIG: App.Locals['config'] = {
    siteConfig: {
        title: "LiBr",
        author: "LiBr",
        desc: "LiBr's blog",
        website: "https://nvme0n1p.dev/",
        locale: "zh-cn",
        twitter: "@0x88ffa357",
        mail: "me@nvme0n1p.dev",
        navs: [
            {
                text: "归档",
                link: "/archive"
            },
            {
                text: "友链",
                link: "/links"
            },
            {
                text: "关于",
                link: "/about"
            },
        ],
    },
    //@ts-ignore
    themeConfig: {
        twikooEnvId: "https://comment.nvme0n1p.dev/.netlify/functions/twikoo",
        //首页顶部大图
        defaultBanner: "/assets/banner.jpg",
        //首页顶部大标题
        indexBannerTitle: "LiBr's Blog",
        //首页顶部小标题
        indexBannerSubtitle: "记录",
        // 颜色主题 0 => 自动切换,1=>日间模式,2=>夜间模式
        colorScheme: 0,
        // 首页板式 0 => 单栏 1 => 双栏
        indexStyle: 0,
        // 打赏二维码
        reward: "",
        //文章内容使用衬线体
        serifincontent: true,
        // 图片懒加载
        lazyload: true,
        // 启用mathjax
        enableMath: true,
        /*如需配置header/footer请前往对应代码处手动修改。*/
        // head输出内容//Deprecated
        head: "",
        // footer输出内容，备案号，统计代码等。//Deprecated
        footer: "",
        // PJAX启用？
        pjax: true,
        // pjax重载函数
        pjaxreload: "",
        // 自定义 Service Worker
        serviceWorker: "",
        // 超高级设置。
        // brandFont: {
        //     src: " ",
        //     style: "normal",
        //     weight: "normal"
        // },
        //桌面端/移动端头图高度。
        desktopBannerHeight: 30,
        mobileBannerHeight: 30,
        // 导航栏模式，随滚动显隐(0)，固定(1)，不固定(2)
        headerMode: 1,
        // 移动端导航栏模式，同上。不设置时默认与 headerMode 一致
        headerModeMobile: 0,
        // 文章字号。当用户在前端自己设置后，该选项会被覆盖。默认为 18px。
        // 1: 14px, 2: 16px, 3: 18px, 4: 20px, 5: 22px
        defaultFontSize: 3,
        // 对代码启用 Fira Code 字体。Fira Code 字体有漂亮的 ligature 特性
        // 由 Google Fonts 提供支持，可能延长页面加载时间
        useFiraCodeFont: true,
        // 在图片下方显示图题
        parseFigcaption: false,
        // 社交 ID，用于生成分享链接
        twitterId: "0x88ffa357",
        // 夜间模式时间段
        darkModeTime: {
            start: 22.5,  // 晚 22 点 30 分开始
            end: 7.0      // 直到早 6 点 59 分
        },
        // 当操作系统为深色主题时主题颜色自动切换，仅在 macOS 10.14.4 及以上版本的 Safari 中可用
        followSystemColorScheme: true,
        //大图集
        largePhotoSet: true,
        // 浏览器原生懒加载（使用img标签新增的loading="lazy"属性实现）
        // 为图片提供更好的SEO支持。只适配较新版本的浏览器，不支持的浏览器将自动加载当前页面下的所有图片
        // 浏览器具体适配情况请参考：https://caniuse.com/loading-lazy-attr
        // 注意：开启后将使得模糊懒加载功能失效
        browserLevelLoadingLazy: true,
        macStyleCodeBlock: true,
        // 代码行数显示
        lineNumbers: true,
        // 自定义添加社交链接
        link: [
            {
                name: "Github",
                icon: "github",
                href: "https://github.com/lbr77",
                target: "_blank"
            },
        ],
        // 自定义导航栏下拉列表。
        nav: [
            {
                name: "",
                title: "",
            }
        ],
        version: "0.0.1"
    }
}