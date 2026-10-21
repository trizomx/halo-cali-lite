# cali lite

参考 cali.so v2 设计方向、以原生 Thymeleaf 实现的轻量 Halo 主题。

## 当前版本

- 主题版本：**0.1.3**
- 目标环境：**Halo 2.27.0 及以上**
- 顶部毛玻璃导航、鼠标光晕、滑动选中指示与渐进增强的页面过渡
- 全屏平铺网格、中性阅读底色、明暗切换与手机布局
- 读取 Halo 实际文章、封面、分类与标签，不附带测试数据

## 安装

下载 [cali-lite-0.1.3.zip](releases/cali-lite-0.1.3.zip)，在 Halo Console 的主题页面上传安装或更新，再启用／重载主题配置。

显示名称为 **cali lite**。内部主题标识 `theme-wulong-lite` 和设置标识保留，以兼容此前安装并保留用户设置；改显示名称不需要修改内部标识。

## 开发和打包

无需 Node、React、Sanity、Clerk、Redis 或云服务密钥。直接编辑 `templates/`、`i18n/` 和 YAML 配置，然后运行：

```bash
python3 package.py
```

安装包生成在 `dist/`，仅包含运行所需文件，不含开发文档、仓库历史、构建工具和测试数据。`dist/` 已被 Git 忽略。

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

详细实现和限制见 [开发说明](docs/开发说明.md)。0.1.2 已由用户确认在站点正常运行；0.1.3 的模板和隔离导航逻辑检查通过，新增视觉动效仍需实站浏览器确认。

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
- [trizomx/wulongxiong-blog 固定参考版本](https://github.com/trizomx/wulongxiong-blog/tree/f91600f145743cb1611073bbb208f4ee839d3226)
- [Oiov 视觉参考](https://www.oiov.dev/blog)
- [Halo 主题开发](https://docs.halo.run/developer-guide/theme/ai)

模板、CSS 和脚本重新编写；不包含参考站点文章、照片、个人资料或第三方付费模板文件。本仓库代码按 [MIT](LICENSE) 许可分发。
