/**
 * @see https://theme-plume.vuejs.press/config/navigation/ 查看文档了解配置详情
 *
 * Navbar 配置文件，它在 `.vuepress/plume.config.ts` 中被导入。
 */

import { defineNavbarConfig } from 'vuepress-theme-plume'

export default defineNavbarConfig([
  { text: '首页', link: '/' },
  { text: '书签', link: '/bookmarks/' },
  {
    text: '博客',
    items: [
      { text: '博客首页', link: '/blog/' },
      { text: '标签', link: '/blog/tags/' },
      { text: '分类', link: '/blog/categories/' },
      { text: '归档', link: '/blog/archives/' },
    ]
  },
  {
    text: '笔记',
    items: [{ text: '示例', link: '/demo/README.md' }]
  },
])
