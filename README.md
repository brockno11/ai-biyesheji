# 基于 AI 赋能的机器学习算法教学平台

> **文档导航**：快速了解项目 → 当前页；深入技术细节 → **[DOCS.md](./DOCS.md)**；AI Agent 开发 → **[SKILLS.md](./SKILLS.md)**；课程全览 → **[COURSE_METHODOLOGY.md](./COURSE_METHODOLOGY.md)**
>
> **当前版本：v3.1.0** | 最近更新：轻量级管理员后端管理系统 + Express 管理 API + 服务端 JSON 持久化 + 操作日志

## 项目简介

面向机器学习初学者的交互式 Web 教学平台。通过 **课程学习、算法可视化、在线代码练习、知识测验、AI 助教和学习中心** 组成完整学习闭环，适合毕业设计答辩、课程设计展示和个人自学。

## 技术栈

| 技术 | 用途 |
|------|------|
| React 18 + TypeScript | UI 框架 + 类型安全 |
| Vite 6 | 构建工具，含 manual chunks 代码分割 |
| Tailwind CSS 3 | 毛玻璃风格 (glass-morphism) 样式方案 |
| React Router v6 | 前端路由 (React.lazy + Suspense 懒加载) |
| Monaco Editor | 在线 Python 代码编辑器 |
| Pyodide 0.29 + Web Worker | 浏览器端 Python 真运行 (numpy + scikit-learn) |
| ECharts 5 + echarts-for-react | 交互式算法可视化 |
| Lucide React | 图标库 |
| localStorage | 学习进度 + 自定义课程/题库 + 概念掌握度 |
| Node / Express (端口 8787) | DeepSeek AI 代理 + 管理员后端管理 API + 服务端 JSON 持久化 |
| DeepSeek API | 真实 AI 助教 (11种场景)；默认 Mock 离线兜底 |
| Zod v4 | 管理员表单校验 + AI 输出结构校验 |
| Vitest + @testing-library/react | 测试框架 (25 用例 / 9 文件) |

## 功能模块

### 当前项目状态（2026-05-11，v3.1.0）

- **内置课程：9 门**（3 门基础概念课 + 6 门算法课），按入门→中级难度编排
  - 基础课 1：机器学习入门与完整流程 (6 个小节)
  - 基础课 2：数据、特征、模型评估与泛化能力 (10 个小节，含超参数/交叉验证/数据泄露)
  - 基础课 3：机器学习 Python 代码入门 (6 个小节)
- **代码练习：12 道**（每门算法 2 道，12/12 均含 Pyodide 真运行+固定测试）
- **测验题目：78 道**（基础课 30 道 + 算法课 48 道）
- **交互式可视化：6 个**（LinearRegressionViz、KNNViz、DecisionTreeViz、KMeansViz、LogisticRegressionViz、RandomForestViz——均含 AI 解释，随机森林含三栏教学引导面板）
- **教学图解：15 个**（Diagram 组件，覆盖 AI/ML/DL 嵌套、任务对比、ML 流程、数据拆分、过拟合等）
- **互动实验组件：10 个**（回归指标/分类指标/过拟合/超参数/CV/数据泄露侦探等，14/14 互动类型全部实现）
- **AI 助教：13 种场景**（问答/概念解释/代码诊断/错题讲解/学习计划/课程草稿/出题/总结/生活例子/可视化解释/练习提示）
- **概念掌握度系统**：conceptMasteryService 追踪基础概念掌握情况
- **管理后台**：课程 CRUD（foundation/algorithm 双表单 + AI 草稿）+ 题库/练习 CRUD（AI 生成 + 启用/停用）

### 1. 首页

- 粒子动态背景 + 鼠标交互（Canvas API）
- 主按钮"开始学习"进入第一门基础课程
- 次级入口"查看学习进度"进入学习中心
- 展示课程数量、练习数、测验数和 AI 助教指标

### 2. 学习中心 (ProgressPage)

- 总体学习进度 + 完成算法数 + 练习次数 + 最高得分 + 测验次数
- 每门算法的学习状态、练习次数、最佳得分和测验成绩
- AI 学习路径推荐（结合本地学习记录生成今日计划）

### 3. 课程学习

- 基础课使用 FoundationCourseContent 微课渲染（二级 Sidebar + 引导问题 + 图解 + 互动 + 测验）
- 算法课使用 AlgorithmPage 模块化渲染（学习目标→核心思想→通俗理解→图解→引导思考→公式→可视化→评估调参→代码→视频巩固→常见误区）
- 支持 B 站教学视频嵌入（4/6 算法有 B站视频，支持多格式 BV 号 URL）
- 15 个教学图解组件 + 10 个专属互动组件

### 4. 算法可视化

- 每个算法均有 ECharts 交互式可视化组件
- 支持参数 slider 调节 + 实时图表更新
- 支持"AI 解释当前现象"

### 5. 代码练习

- Monaco Editor 在线 Python 编辑器
- 规则检查 (codeCheckService) → Pyodide Web Worker 真运行 → 四维综合评分 → AI 诊断
- 全部 12 道练习通过 Web Worker 执行 Pyodide 真运行

### 6. 知识测验

- 每门课程配套选择题测验，当前共 78 道内置测验题（基础课 30 道）
- 自动评分 + 答案解析 + AI 错题讲解

### 7. AI 助教

- DeepSeek 在线模式 + Mock 离线演示模式，自动 fallback
- 13 种 AI 场景，JSON 模式输出经 Zod 校验
- API Key 仅在后端环境变量，前端通过 `/api/ai/chat` 代理调用

### 8. 管理后台

- 个人中心 → 课程管理入口（不出现在主导航栏）
- 课程管理：foundation/algorithm 类型感知双表单 + AI 课程草稿生成（支持面向对象/风格/互动/测验/代码等详细设计要求）
- 题库管理：练习题/测验题 CRUD + 题目启用/停用 + AI 生成练习题 + AI 生成测验题 + 按课程/来源/状态筛选 + 关键词搜索 + 导入/导出（"更多操作"下拉菜单，危险操作二次确认）

## 安装和运行

```bash
cd E:\projects\ai-biyesheji
npm install
npm run dev          # 同时启动 Vite(:3000) + Express AI代理(:8787)
npm run build        # 生产构建
```

## 项目亮点

1. **零数据库依赖**：静态课程/题库数据 + localStorage 自定义覆盖 + AI 轻量 Express 代理
2. **学习闭环完整**：课程学习 → 可视化探索 → 代码练习 → 测验验证 → 学习中心追踪
3. **AI 可在线也可离线**：DeepSeek + Mock fallback 覆盖 13 种助教能力
4. **代码练习全 Pyodide 覆盖**：12/12 道练习均含真运行+固定测试
5. **互动全覆盖**：14/14 InteractionType 均实现专属组件或问答兜底
6. **管理入口收敛**：管理后台仅从个人中心进入
7. **内容完整**：9 门课程、12 道练习(全Pyodide)、78 道测验、15 图解+10 互动实验
8. **B站视频全覆盖**：6/6 算法有 B站视频，强制手动播放不打扰学习
9. **身份认证系统**：登录/注册/游客模式，学生与管理员角色分级，localStorage 持久化
10. **管理员后端管理**：Express 管理 API + Token 鉴权 + 服务端 JSON 持久化 + 操作日志 + 导入导出 + 后端离线 fallback

## AI Agent 开发指引

项目内置 19 个 Claude Code Skills（`.claude/skills/`），覆盖前端开发、数据可视化、后端 API、代码审查、测试、UI 设计、学术写作、文档处理。

> 新 Agent 加入开发前，请先阅读 **[SKILLS.md](./SKILLS.md)** 了解全部技能清单。

## 后续扩展方向

短期：E2E 测试、综合测验；中期：用户系统、新增算法；长期：社区、移动端 App、国际化
