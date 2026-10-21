# 使用ChatGPT自动化开发

## cali lite

参考 cali.so v2 设计方向、以原生 Thymeleaf 实现的轻量 Halo 主题。

源码仓库：[trizomx/halo-cali-lite](https://github.com/trizomx/halo-cali-lite)。

## 当前版本

- 主题版本：**0.1.7**
- 目标环境：**Halo 2.27.0 及以上**
- 顶部毛玻璃导航、鼠标光晕、滑动选中指示与渐进增强的页面过渡
- 全屏平铺网格、中性阅读底色、明暗切换与手机布局
- 首页单头像：下滑收缩至页头，回顶展开；跨页共享头像过渡及兼容回退
- 首页封面大图卡片、模糊封面信息区、真实摘要、日期与分类；无封面时自动简化
- 读取 Halo 实际文章、封面、分类与标签，不附带测试数据

## 安装

下载 [cali-lite-0.1.7.zip](releases/cali-lite-0.1.7.zip)，在 Halo Console 的主题页面上传安装，再选择并启用 **cali lite**。源码交付目录的 `releases/` 中也附有安装包。

内部主题标识为 `theme-cali-lite`，设置标识为 `theme-cali-lite-setting`，配置标识为 `theme-cali-lite-config`。从 0.1.4 及更早版本安装本版时，Halo 会识别为新主题，旧主题设置不会自动继承，请先记录并重新填写；文章、附件及其他站点数据不受影响。

## 开发和打包

无需 Node、React、Sanity、Clerk、Redis 或云服务密钥。直接编辑 `templates/`、`i18n/` 和 YAML 配置，然后运行：

```bash
python3 package.py
```

安装包生成在 `dist/`，包含运行文件、README、MIT 许可和 `docs/开发说明.md`，不含仓库历史、构建工具和测试数据。`dist/` 已被 Git 忽略。源码包同样附带开发说明。

`releases/` 中保留当前可安装版本作为备份快照。后续发布可将 `dist/` 中的新 ZIP 上传到 GitHub Releases，或有意更新该目录。

## 目录

```text
templates/          原生页面、公共布局和 CSS / JavaScript
i18n/               默认消息
theme.yaml          主题身份、版本和目标 Halo 版本
settings.yaml       首页与关于设置
package.py          Python 标准库打包脚本
docs/开发说明.md     设计、实现与验证记录
releases/           可安装的版本快照
```

每次开发前先阅读 [项目开发约定](AGENTS.md) 和 [开发说明](docs/开发说明.md) 中的参考与准则；这些约定仅适用于本项目。详细实现和限制见开发说明。0.1.2 已由用户确认在站点正常运行；后续版本通过模板和隔离导航逻辑检查，视觉动效仍需实站浏览器确认。

## 备份更新

修改源码并重新打包后，使用 Git 提交和推送：

```bash
git add .
git commit -m "Update cali lite"
git push origin main
```

主题安装包只包含主题代码，不包含 Halo 的文章、附件、评论或数据库。站点数据需通过 Halo 自身备份功能另行备份。

## 参考与许可

- [cali.so v2.0](https://github.com/CaliCastle/cali.so/tree/v2.0)
- [Oiov 视觉参考](https://www.oiov.dev/blog)
- [Halo 主题开发](https://docs.halo.run/developer-guide/theme/ai)

模板、CSS 和脚本重新编写；不包含参考站点文章、照片、个人资料或第三方付费模板文件。本仓库代码按 [MIT](LICENSE) 许可分发。

0.1.4：点击导航后，指示线在目标页面加载完成后再移动，不随悬浮或焦点提前切换。

0.1.5：主题、设置和配置统一使用 cali-lite 标识，源码仓库地址统一为本仓库；README 顶部加入自动化开发声明，安装包和源码包均附开发说明。

0.1.6：导航字体桌面 14px、手机 13px，绿色指示线 1.5px；项目开发约定与开发说明记录全部指定参考来源，要求每次开发前阅读。

0.1.7：首页只显示一个头像，下滑逐渐收缩到页头；从首页离开时执行头像收缩过渡。首页文章预览改为参考 v2.0 的封面卡片及模糊信息区，保留实际摘要和无封面回退。
