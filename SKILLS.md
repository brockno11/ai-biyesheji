# 项目 Skills 清单

> 本项目使用的 AI Agent Skills 列表。新 agent 加入开发时，可直接使用项目 `.claude/skills/` 目录下的技能文件，或按下方链接下载到全局目录。

---

## 使用方式

### 方式一：直接使用项目内置 skills（推荐）

项目 `.claude/skills/` 目录已包含所有技能文件，**无需额外下载**。Claude Code 会自动加载该目录下的技能。

### 方式二：安装到全局

```bash
npx -y @lobehub/market-cli skills install <skill-identifier> --agent claude-code --global
```

---

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
| 10 | react | React | LobeHub 生态 React 组件指南 |

---

## 详细清单

### 1. senior-frontend

- **功能**：React/TypeScript/Tailwind CSS 现代前端开发，包含组件脚手架、性能优化、打包分析、UI 最佳实践
- **适用场景**：开发前端功能、优化性能、实现 UI/UX 设计、状态管理、前端代码审查
- **下载链接**：https://lobehub.com/skills/davila7-claude-code-templates-senior-frontend
- **LobeHub 安装**：`npx -y @lobehub/market-cli skills install davila7-claude-code-templates-senior-frontend --agent claude-code`
- **项目路径**：`.claude/skills/senior-frontend/SKILL.md`

---

### 2. data-viz-2025

- **功能**：React/TypeScript/Tailwind 数据可视化，遵循 Tufte 原则和 NYT Graphics 标准。覆盖 Recharts、Nivo、D3.js、Observable Plot、Visx、Tremor 等库
- **适用场景**：数据图表、仪表盘、交互式可视化、复杂图表（Sankey/网络图等）
- **下载链接**：https://lobehub.com/skills/erichowens-some_claude_skills-data-viz-2025
- **GitHub**：https://github.com/curiositech/windags-skills/tree/main/skills/data-viz-2025
- **项目路径**：`.claude/skills/data-viz-2025/SKILL.md`

---

### 3. fullstack-dev

- **功能**：全栈后端架构与前后端集成指南。包含 Express/Node/Django/Go 后端、REST API 设计、认证流程、数据库集成、SSE/WebSocket 实时功能、生产环境加固
- **适用场景**：构建全栈应用、创建 REST API、脚手架后端服务、实时应用、CRUD 应用
- **下载链接**：https://lobehub.com/skills/minimax-ai-skills-fullstack-dev
- **GitHub**：https://github.com/MiniMax-AI/skills/tree/main/skills/fullstack-dev
- **项目路径**：`.claude/skills/fullstack-dev/SKILL.md`

---

### 4. add-educational-comments

- **功能**：自动为代码文件添加教育性注释，支持配置学习者等级（初级/中级/高级），保持文件编码和缩进风格
- **适用场景**：代码教学、新人入职、代码审查注释、文档化、工作坊材料
- **下载链接**：https://lobehub.com/skills/aleister1102-skills-add-educational-comments
- **LobeHub 安装**：`npx -y @lobehub/market-cli skills install aleister1102-skills-add-educational-comments --agent claude-code`
- **项目路径**：`.claude/skills/aleister1102-skills-add-educational-comments/SKILL.md`

---

### 5. frontend-code-review

- **功能**：前端代码审查，支持 .tsx/.ts/.js 文件。两种模式：待提交变更审查 + 指定文件审查。按代码质量/性能/业务逻辑三类标记问题
- **适用场景**：提交前代码审查、文件级代码审查
- **下载链接**：https://lobehub.com/skills/langgenius-dify-frontend-code-review
- **GitHub**：https://github.com/langgenius/dify/tree/main/.agents/skills/frontend-code-review
- **项目路径**：`.claude/skills/frontend-code-review/SKILL.md`

---

### 6. senior-qa

- **功能**：React/Next.js/Node.js 应用的质量保证和测试自动化。包含测试套件生成、覆盖率分析、E2E 测试脚手架
- **适用场景**：设计测试策略、编写测试用例、实现测试自动化、分析测试覆盖率
- **下载链接**：https://lobehub.com/skills/davila7-claude-code-templates-senior-qa
- **LobeHub 安装**：`npx -y @lobehub/market-cli skills install davila7-claude-code-templates-senior-qa --agent claude-code`
- **项目路径**：`.claude/skills/davila7-claude-code-templates-senior-qa/SKILL.md`

---

### 7. api-designer

- **功能**：REST/GraphQL API 设计规范。OpenAPI 3.0/3.1 规范生成、资源建模、版本策略、分页模式、错误处理标准、认证模式
- **适用场景**：设计 API、创建 OpenAPI 规范、规划 API 架构
- **下载链接**：https://lobehub.com/skills/openclaw-skills-api-designer
- **LobeHub 安装**：`npx -y @lobehub/market-cli skills install openclaw-skills-api-designer --agent claude-code`
- **项目路径**：`.claude/skills/openclaw-skills-api-designer/SKILL.md`

---

### 8. frontend-design

- **功能**：创建具有高设计质量的独特前端界面，避免通用 AI 美学。覆盖排版、色彩、动效、空间构图、视觉细节
- **适用场景**：构建网页组件、落地页、仪表盘、React 组件、HTML/CSS 布局、美化 UI
- **下载链接**：https://lobehub.com/skills/anthropics-skills-frontend-design
- **GitHub**：https://github.com/anthropics/skills/tree/main/skills/frontend-design
- **项目路径**：`.claude/skills/frontend-design/SKILL.md`

---

### 9. frontend-ui-ux

- **功能**：设计师视角的 UI/UX 开发，注重色彩和谐、排版、微交互、空间构图。即使没有设计稿也能创建精美的界面
- **适用场景**：UI/UX 开发、界面美化、交互设计
- **下载链接**：https://lobehub.com/skills/code-yeongyu-oh-my-opencode-frontend-ui-ux
- **GitHub**：https://github.com/code-yeongyu/oh-my-openagent/tree/dev/src/features/builtin-skills/frontend-ui-ux
- **项目路径**：`.claude/skills/frontend-ui-ux/SKILL.md`

---

### 10. react

- **功能**：React 组件开发指南（LobeHub 生态）。包含 @lobehub/ui 组件使用、antd-style 样式方案、Next.js + React Router 混合路由、Zustand 状态管理
- **适用场景**：React 组件创建/修改、UI 开发、路由实现、前端功能构建
- **下载链接**：https://lobehub.com/skills/lobehub-lobehub-agents-skills-react-skill-md
- **GitHub**：https://github.com/lobehub/lobehub/tree/canary/.agents/skills/react
- **项目路径**：`.claude/skills/react/SKILL.md`

---

## 快速安装命令（批量）

```bash
# 切换到项目目录
cd E:/projects/ai-biyesheji

# 方式一：使用项目内置 skills（无需操作，自动加载）

# 方式二：通过 LobeHub CLI 安装（需安装的 4 个）
npx -y @lobehub/market-cli skills install davila7-claude-code-templates-senior-frontend --agent claude-code
npx -y @lobehub/market-cli skills install aleister1102-skills-add-educational-comments --agent claude-code
npx -y @lobehub/market-cli skills install davila7-claude-code-templates-senior-qa --agent claude-code
npx -y @lobehub/market-cli skills install openclaw-skills-api-designer --agent claude-code
```

---

## 对应本项目技术栈

| 项目技术 | 相关 Skills |
|----------|------------|
| React 18 | senior-frontend, frontend-design, frontend-ui-ux, react |
| TypeScript | senior-frontend, frontend-code-review, senior-qa |
| Tailwind CSS | senior-frontend, frontend-design, data-viz-2025 |
| ECharts | data-viz-2025 |
| Express | fullstack-dev, api-designer |
| DeepSeek API | fullstack-dev (API 集成模式) |
| Monaco Editor | senior-frontend (组件开发) |
| React Router v6 | react, senior-frontend |
| 教学功能 | add-educational-comments |
| 测试 | senior-qa |
