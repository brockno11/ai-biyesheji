# 项目 Skills 清单

> 本项目内置 19 个 Claude Code Skills，位于 `.claude/skills/`。新 Agent 加入开发时自动加载，无需额外下载。

## Skills 清单一览

| # | 技能名称 | 类别 | 说明 |
|---|---------|------|------|
| 1 | senior-frontend | 前端开发 | React/TS/Tailwind 全栈前端开发 |
| 2 | data-viz-2025 | 数据可视化 | ECharts/Recharts/D3 图表与仪表盘 |
| 3 | fullstack-dev | 后端开发 | Express/REST API/全栈架构 |
| 4 | add-educational-comments | 教育 | 代码教学注释自动生成 |
| 5 | frontend-code-review | 代码审查 | .tsx/.ts 前端代码审查 |
| 6 | senior-qa | 测试 | React/Node 测试套件与 E2E |
| 7 | api-designer | API 设计 | OpenAPI/REST/GraphQL 规范 |
| 8 | frontend-design | 设计 | 高质量前端界面设计 |
| 9 | frontend-ui-ux | UI/UX | 设计师视角 UI/UX 开发 |
| 10 | react | React | LobeHub 生态 React 组件指南（仅参考） |
| 11 | shadcn-ui | UI 组件库 | Card/Badge/Accordion/Tabs 等统一 UI |
| 12 | ui-designer | 设计系统 | 统一视觉风格和设计系统 |
| 13 | react-bits | 动画 | 110+ 可复制动画组件（轻量动效） |
| 14 | anthropics-skills-docx | 文档 | Word 文档创建编辑（论文正文） |
| 15 | anthropics-skills-pdf | 文档 | PDF 读取生成处理 |
| 16 | anthropics-skills-pptx | 演示 | PPT 演示文稿（答辩 PPT） |
| 17 | academic-writing | 学术 | 学术写作、研究设计、论文表达 |
| 18 | markitdown | 文档转换 | PDF/DOCX/PPTX/XLSX → Markdown |
| 19 | latex-thesis-zh | 论文 | 中文 LaTeX 学位论文辅助 |

## v3.1.0 本轮使用的 Skills

| Skill | 对应工作 |
|------|----------|
| fullstack-dev | Express 后端架构设计、服务端 JSON 持久化(原子写入)、adminStorageService、Token 鉴权中间件 |
| api-designer | /api/admin REST API 设计(统一响应格式/错误码/CRUD/导入导出)、curl 自动化测试 |
| senior-frontend | adminApiService 前端接入、AdminPage 后端状态卡片/登录表单/操作日志 Tab、数据合并策略、后端离线 fallback |
| frontend-code-review | 全链路 TypeScript 检查、.gitignore 安全审计 |
| senior-qa | npm test / npm run build / npx tsc 三合一验证 |

## v3.0.0 本轮使用的 Skills

| Skill | 对应工作 |
|------|----------|
| senior-frontend | 身份认证系统(登录/注册/游客/角色权限)、ProtectedRoute路由守卫、LoginModal Portal、页面切换scrollTo |
| frontend-code-review | 全面代码审计(10+死代码清理/ID冲突修复/文案修正/模型名更正/难度徽章三色) |
| frontend-design / frontend-ui-ux | 登录弹窗纯净设计、难度徽章配色、Sidebar清理 |
| senior-qa | npm test / npm run build / npx tsc 三合一验证 |

## 快速安装命令（新 Agent 按需安装）

```bash
# 开发 Skills
npx -y @lobehub/market-cli skills install davila7-claude-code-templates-senior-frontend --agent claude-code --global
npx -y @lobehub/market-cli skills install davila7-claude-code-templates-senior-qa --agent claude-code --global
npx -y @lobehub/market-cli skills install aleister1102-skills-add-educational-comments --agent claude-code --global

# 论文相关 Skills
npx -y @lobehub/market-cli skills install anthropics-skills-docx --agent claude-code --global
npx -y @lobehub/market-cli skills install jamditis-claude-skills-journalism-academic-writing --agent claude-code --global
npx -y @lobehub/market-cli skills install k-dense-ai-claude-scientific-skills-markitdown --agent claude-code --global
npx -y @lobehub/market-cli skills install anthropics-skills-pptx --agent claude-code --global
```

## 技术栈对应 Skills

| 项目技术 | 相关 Skills |
|----------|------------|
| React 18 + TypeScript | senior-frontend, frontend-code-review, senior-qa |
| Tailwind CSS | senior-frontend, frontend-design, data-viz-2025 |
| ECharts | data-viz-2025 |
| Express / DeepSeek API | fullstack-dev, api-designer |
| Monaco Editor | senior-frontend (组件开发) |
| 教学功能 | add-educational-comments |
| 测试 | senior-qa |
| 学术写作 | academic-writing, docx, latex-thesis-zh |
| 文档处理 | pdf, markitdown, pptx |
| 图解/互动 | data-viz-2025, frontend-design, frontend-ui-ux |
| 代码审查 | frontend-code-review |

## Agent 使用建议

| 场景 | 推荐 Skill |
|------|-----------|
| 新建 React 组件/页面 | senior-frontend |
| 课程图解/互动组件 | data-viz-2025, frontend-design |
| UI 美化 | frontend-design, frontend-ui-ux, shadcn-ui |
| 代码审查 | frontend-code-review |
| 编写测试 | senior-qa |
| 添加教学注释 | add-educational-comments |

> 注意：`react` skill 面向 LobeHub 生态，与本项目技术栈不完全匹配，仅作参考。所有 skills 文件位于 `.claude/skills/`，无需重新下载。
