# VoiceLens AI — AI 用户反馈分析 Agent

VoiceLens AI 将批量用户评论自动转化为问题分布、重点 Pain Points 与可行动建议，帮助产品和运营人员完成第一轮反馈分析。

## 在线演示

- 项目介绍：https://fhh34890.github.io/hhub/
- 真实分析报告：`demo/dashboard.html`

## 核心流程

```text
CSV 导入与校验
→ 动态标签生成 / 复用 / 预览
→ 批量分类
→ 问题频率与反馈性质统计
→ Pain Point 识别
→ 综合影响、频率与证据筛选 Top 10
→ Recommendation / Reason
→ Dashboard
```

## 示例验证

- 输入：500 条公开 App Store 评论
- 分类失败：0 条
- 可行动反馈：409 条（81.8%）
- 完整 Pain Points：238 项
- Dashboard 重点展示：Top 10

## 说明

本仓库是用于求职作品集的静态公开演示版，不包含模型密钥、用户上传数据或可直接调用的分析接口。完整 Agent 在本地运行，支持 CSV 上传、动态标签、运行进度、有限重试、独立 Run ID 和历史报告。
