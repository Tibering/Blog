# Homepage Redesign — Personal Blog Identity

**Date**: 2026-07-21
**Status**: approved

## Goal

修改网站首页，明确体现"个人博客"定位，使标题和内容一致。

## Changes

### 1. config.ts — 站点级 meta

- `title`: `Moon Caffee` → `Moon Caffee's Blog`
- `description`: `一个学习小站` → `个人博客 / 学习笔记 / 技术随想`

### 2. plume.config.ts — 首页 profile 区域

- `profile.name`: `Moon Caffee`（不变）
- `profile.description`: `一个学习小站` → `个人博客 — 记录学习，分享技术`

### 3. README.md — 首页内容

替换技术文档为博客欢迎内容：

- 标题：`# Moon Caffee's Blog`
- 欢迎语 + 简短说明
- "关于我" 板块
- 文章列表由 VuePress plume 主题自动生成

## Files Changed

- `docs/.vuepress/config.ts`
- `docs/.vuepress/plume.config.ts`
- `README.md`
