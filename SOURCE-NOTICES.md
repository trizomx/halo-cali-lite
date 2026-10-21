# 源码来源与第三方声明

## cali lite

本仓库新增的 Halo 适配、构建工具和文档适用根目录 `LICENSE`（MIT，Copyright 2026 trizomx）。第三方原有代码的权利不因本仓库的 MIT 声明而改变。

## cali.so v2 与参考 fork

组件迁移来源为 CaliCastle/cali.so 的 **tag v2.0** 与 trizomx/wulongxiong-blog。具体路径、两个副本的文件 SHA256、编译 CSS 的来源 URL 与 SHA256 记录在源码 `src/cali/sources.json`；组件逐项适配见 `docs/源码迁移对照.md`。模板中的 source 注释、生成文件头和本声明均须保留。

本轮检查的两个源码快照没有发现独立 LICENSE 文件。因此不把其组件、图标、自定义排版或项目配置宣称为本仓库原创，也不宣称原项目具有 MIT 许可。原作者教程提到 Tailwind UI 基础，这也不能视为对第三方付费模板的再许可。本交付没有附带原作者个人内容、照片、密钥、云服务代码或整套付费模板；按用户要求对相关公开组件作 Halo 适配。后续公开分发时仍需保留并核实原有权利条件。

## Tailwind CSS 3.4.1

参考站编译 CSS 中的 Tailwind 工具规则被选择性抽取，保留其 MIT 标识。完整快照只在源码交付中用于可重复构建；安装包仅含被使用的规则及适配。参考站自定义规则及组件的来源边界见上一节，不因 Tailwind 的许可而自动改变。

https://github.com/tailwindlabs/tailwindcss/blob/v3.4.1/LICENSE

MIT License

Copyright (c) Tailwind Labs, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## cali.so v3：仅独立照片页

用户明确授权参考 main/v3 的照片页。本次实际读取并固定到 `edd108445c5323a9199af968913876aa37ea59d2`，不是把现有 v2 组件升级到 main，也未假定存在 v3.0 Git tag。布局来源为 `app/_views/photos-page.tsx`、`components/published-photo-wall.tsx` 和 `app/globals.css` 中的瀑布流、取景框及入场规则；原路径与 SHA256 见源码 `src/photos/sources.json`。相关快照和完整许可见 `src/photos/upstream/`。Halo 配置、宽版容器、原生灯箱和质量切换为适配。未复制原作者照片、身份内容、云服务数据或演示数据。

该 v3 快照的原始应用源码采用 MIT；内容和素材例外仍保留。v2 的来源声明保持独立。原许可如下：

MIT License

Copyright (c) 2022-2026 Cali Castle

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Content and asset exception

The MIT License above applies only to original application source code in this
repository. It does not apply to personal writing or other authored content;
photographs; illustrations or artwork; Cali Castle's name, identity, likeness,
logos, branding, or personal data; or third-party assets. Those materials
remain under their respective rights and may not be copied or reused except as
separately permitted by their rights holders or applicable law.
