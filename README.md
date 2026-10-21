# 使用ChatGPT自动化开发

## cali lite 0.2.1

基于 cali.so **tag v2.0** 与用户 fork 的组件结构迁移到 Halo 的原生 Thymeleaf 主题。卡片、文章详情、项目与订阅组件保留源层级和 utility class，复用对应编译样式；React／Sanity 数据与交互改接 Halo 和原生浏览器 API。

源码仓库：[trizomx/halo-cali-lite](https://github.com/trizomx/halo-cali-lite)。目标：**Halo >=2.27.0**。

- 全屏易读网格、明暗外观、毛玻璃顶部导航；加载完成后切换指示，连续滚动收起。
- 首页单头像滚动收缩；左侧文章卡片、右侧便签及邮件订阅，侧栏纵向展示项目。
- 统一有图／无图卡片、照片主色与生成色、原版分层渐变和模糊质感。
- 文章详情：源版三栏、分段入场、UFO加载反馈、H1–H4目录、阅读进度与代码复制。
- 项目页模板与首页共用项目设置，图标／简介／外链和鼠标跟随虚线效果。
- 首页和页脚两处订阅，支持现成订阅页链接或表单POST；未接服务不收集邮箱、不伪造成功。
- **6组、40项后台设置**，项目页下拉选择、项目列表编辑及上传图标，无需修改代码。
- 正式安装包和源码都附开发说明，没有测试文章、图片、依赖或密钥。

## 安装与配置

上传 [cali-lite-0.2.1.zip](releases/cali-lite-0.2.1.zip) 到 Halo Console → 主题并更新；若新设置和“项目”模板没有出现，点击“重载主题配置”。

内部身份 `theme-cali-lite`、Setting `theme-cali-lite-setting`、ConfigMap `theme-cali-lite-config` 保持不变，同身份更新保留设置。

项目页：新建并公开发布独立页面 → 模板选“项目” → 主题设置“项目展示”里下拉选择该页面。项目内容在“项目列表”添加，默认空列表，首页展示前3项（数量可改）。

订阅：在“邮件订阅”粘贴邮件服务提供的现成订阅页面地址最方便；高级方式可配置其原生HTML表单POST地址及邮箱字段。真正发送、存储、退订由该服务负责，主题没有内置邮件后台。

站点标题、Logo、favicon和文章条数继续使用 Halo 系统设置。完整操作见 [开发说明](docs/开发说明.md)。

## 开发与交付

开始前必读 [AGENTS.md](AGENTS.md)、[开发说明](docs/开发说明.md) 和 [源码迁移对照](docs/源码迁移对照.md)。仅约束本项目。上游限定 tag v2.0，不使用最新main；来源与许可边界见 [SOURCE-NOTICES](SOURCE-NOTICES.md)。

```text
src/cali/       源组件迁移源码、规则快照、来源哈希
scripts/        源样式抽取与生成工具
templates/      Halo外壳；source组件、文章页和资源部分为生成文件
i18n/           默认消息
docs/           操作、迁移及验证说明
settings.yaml   6组主题设置
theme.yaml      身份、兼容与自定义项目模板
```

无需npm、React或原项目云服务。运行：

```bash
python3 package.py
```

先从 `src/cali/` 构建，再在 `dist/` 生成安装ZIP、源码ZIP和已解压源码目录。带Generated标记的文件禁止直接编辑。安装包只含运行文件及文档；源码包另含构建源码、开发约定和当前安装包。

已通过140次 Halo兼容类型的本地Thymeleaf渲染与隔离交互检查；尚未完成本轮真实浏览器视觉和完整Halo部署验收。0.1.2曾由用户确认实站运行，不能替代0.2.1的部署验证。

## 备份

在源码仓库中提交并推送到自己的GitHub仓库即可备份。主题包不包含Halo的文章、附件或数据库，站点内容另用Halo备份功能。本轮没有自动推送或修改线上站点。

## 参考与许可

- [cali.so v2.0](https://github.com/CaliCastle/cali.so/tree/v2.0)
- [Oiov视觉参考](https://www.oiov.dev/blog)
- [Halo主题AI准则](https://docs.halo.run/developer-guide/theme/ai)

本仓库新增适配按 [MIT](LICENSE) 提供；原组件来源、编译规则和第三方权利另见 [SOURCE-NOTICES](SOURCE-NOTICES.md)。不包含源站文章、照片、个人资料和服务密钥。

0.2.1：从源编译样式补回伪元素初始化，移除卡片信息区额外主色底；取色按整图颜色占比选择，不再加权饱和度；无图配色按文章打散。首页右侧“随便看看”改为“我的项目”，移除底部重复项目区。AGENTS 新增源码优先迁移规则。
