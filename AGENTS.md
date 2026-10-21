# cali lite 项目开发约定

本文件仅约束本仓库及其子目录，不写入全局偏好或其他项目。

## 每次开发前必须阅读

1. 阅读本文件和 `docs/开发说明.md`，特别是“项目参考与每次开发前必读”及最近版本的实现、限制和验证记录。
2. 阅读 Halo 主题 AI 准则：https://docs.halo.run/developer-guide/theme/ai 。通过主题开发指南 https://docs.halo.run/developer-guide/theme/ 和 https://docs.halo.run/llms.txt 查找本次任务相关的文档正文；不能把索引当作正文。优先使用线上完整 `.md` 页面，避免单独读取不完整 include 片段。
3. 修改前确认 `theme.yaml` 的 `spec.requires`（当前 >=2.27.0），核对相关 API 变更、页面变量和 Finder API；文档未覆盖的行为应以目标版本 Halo 源码为准。涉及模板时先阅读 Thymeleaf 和对应页面文档，不猜测表达式方法。
4. 根据任务阅读以下参考项目的相关源码或页面；上游只允许参考 **tag v2.0**，不能用最新 main 代替：
   - 用户 fork 参考源码：https://github.com/trizomx/wulongxiong-blog 。它是参考项目，不是本主题的发布仓库。
   - 原作者源码：https://github.com/CaliCastle/cali.so/tree/v2.0 。
   - 已部署视觉参考：https://www.oiov.dev/ （文章列表 https://www.oiov.dev/blog ）。
   - 原作者部署教程：https://cali.so/blog/guide-for-cloning-my-site 。

若外部文档无法读取，应说明限制，不得声称已读或凭空假定 API；使用已核实的项目实现完成不依赖缺失资料的修改。

## 本项目必须遵守

- 本主题源码和发布仓库为 https://github.com/trizomx/halo-cali-lite ；不得误改为参考 fork。
- 原生 Halo / Thymeleaf 主题，`templates/` 是直接维护的源码；无 React、Next.js 或云服务依赖。执行 `python3 package.py` 生成 `dist/` 安装包，不能手工修改 ZIP 中的文件作为开发方式。
- 不使用 `#request`、`#response`、`#session`、`#servletContext` 或未经确认的表达式方法。配置按 Halo JsonNode 属性访问规则读取，保留空值回退。
- 站点基础信息使用 Halo 系统设置；不重复注入系统 SEO 标签。链接使用对象 permalink 和 Halo 路由配置，保留公共布局契约与 `<halo:footer />`。
- 保留主题身份 `theme-cali-lite`、设置 `theme-cali-lite-setting`、配置 `theme-cali-lite-config`，除非用户再次明确要求更改。
- 保留全屏平铺网格和易读底色、顶部毛玻璃导航（逐像素随滚动向上移出，反向滚动连续恢复，不做阈值触发的弹走动画）、目标页加载完成后指示线才切换的行为。首页不渲染头像旁站点名称，其他页面静态显示，不做文字切换动画。不得将“取消动效”误改成首页显示名称。
- 保留首页单头像：下滑缩入页头、回顶展开、从首页离开时共享过渡或短动画回退；其他页面继续显示页头小头像。首页文章采用真实封面预览卡片，无封面时回退文字卡片。
- 容器按 v2.0 Container 断点：<640px 两侧16px；640–1023px 两侧64px、内容最大672px；>=1024px 两侧112px、内容最大1024px。首页左文章右侧栏，右栏内侧64px、>=1280px为80px。
- 首页、文章归档、分类、标签、作者列表使用同一 card 片段；封面240:135，信息区内边距16px（>=768px为20px），不额外增加摘要段。文章列表>=1024px双列、间距32px，其他为单列、间距24px。卡片高度随实际标题和信息换行，不任意设置固定高度。保留真实分类、浏览量与估算阅读时长，不伪造统计。
- README 首行保留“使用ChatGPT自动化开发”一级标题。参考来源集中记录在开发说明；不得恢复用户已删除的固定提交参考许可条目。保留 MIT 许可。
- 源码包和安装包都附 `docs/开发说明.md`；源码交付包含本文件。测试数据、模拟文章、预览文件、依赖、密钥和仓库历史不进入安装包；交付源码目录也不含测试数据。
- 按改动范围执行现有必要检查，明确区分本地逻辑检查、真实浏览器检查和 Halo 实站验证，不夸大验收结果。
