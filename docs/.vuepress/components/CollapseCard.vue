<!--
  折叠卡片组件 — 标题始终可见，点击后在下方展开/收起正文

  Props:
    title    - 卡片标题（必填）
    category - 分类标签（可选），显示为标题前的彩色徽标
  Slot:
    default - 正文内容，支持 Markdown / HTML / 代码块
-->
<template>
  <div class="collapse-card" :class="{ expanded: !collapsed }">
    <button
      class="collapse-card__header"
      :aria-expanded="!collapsed"
      @click="collapsed = !collapsed"
    >
      <span class="collapse-card__title-row">
        <span v-if="category" class="collapse-card__category">{{ category }}</span>
        <span class="collapse-card__title">{{ title }}</span>
      </span>
      <span class="collapse-card__arrow" />
    </button>
    <div class="collapse-card__body">
      <div class="collapse-card__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ title: string; category?: string }>()

const collapsed = ref(true)
</script>

<style scoped>
/* ===== 卡片容器 ===== */
.collapse-card {
  position: relative;
  border: 1px solid var(--vp-c-border, #e4e4e9);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg, #ffffff);
  box-shadow: 0 1px 2px rgba(0,0,0,0.03);
  transition: box-shadow 0.3s ease, transform 0.3s ease,
              border-color 0.3s ease, background 0.3s ease;
}

/* 左侧装饰条 */
.collapse-card::before {
  content: '';
  position: absolute;
  top: 14px;
  bottom: 14px;
  left: 0;
  width: 3px;
  border-radius: 0 3px 3px 0;
  background: var(--vp-c-text-3, #c2c2cc);
  transition: background 0.3s ease, top 0.3s ease, bottom 0.3s ease;
}

.collapse-card:hover {
  border-color: var(--vp-c-border-hover, #cdd5e0);
  box-shadow: 0 2px 8px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
  background: var(--vp-c-bg-soft-up, #fdfdfe);
}

.collapse-card:hover::before {
  background: var(--vp-c-brand-light, #8ab8e0);
}

.collapse-card.expanded {
  border-color: var(--vp-c-brand-soft, #b8d4f0);
  box-shadow: 0 2px 12px rgba(58,141,201,0.1), 0 1px 4px rgba(0,0,0,0.04);
  background: var(--vp-c-bg-soft, #fafbfd);
}

.collapse-card.expanded::before {
  top: 18px;
  bottom: 18px;
  background: var(--vp-c-brand, #3a8dc9);
  box-shadow: 0 0 8px rgba(58,141,201,0.3);
}

/* ===== 标题栏 ===== */
.collapse-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 16px 20px 16px 18px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  text-align: left;
}

.collapse-card__title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

/* 分类徽标 */
.collapse-card__category {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  background: var(--vp-c-brand-soft, #e4eff9);
  color: var(--vp-c-brand, #3a8dc9);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.3s, color 0.3s;
}

.collapse-card.expanded .collapse-card__category {
  background: var(--vp-c-brand, #3a8dc9);
  color: #fff;
}

.collapse-card__title {
  font-size: 0.93rem;
  font-weight: 600;
  color: var(--vp-c-text-1, #1e1e24);
  transition: color 0.3s;
  letter-spacing: 0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.collapse-card.expanded .collapse-card__title {
  color: var(--vp-c-brand, #3a8dc9);
}

/* ===== 右侧箭头圆形按钮 ===== */
.collapse-card__arrow {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--vp-c-bg-mute, #f3f4f6);
  flex-shrink: 0;
  transition: background 0.3s;
}

.collapse-card__arrow::after {
  content: '';
  width: 6px;
  height: 6px;
  border-right: 2px solid var(--vp-c-text-3, #9696a8);
  border-bottom: 2px solid var(--vp-c-text-3, #9696a8);
  border-radius: 1px;
  transform: rotate(45deg) translateY(-1px);
  transition: transform 0.3s cubic-bezier(0.4,0,0.2,1), border-color 0.3s;
}

.collapse-card.expanded .collapse-card__arrow {
  background: var(--vp-c-brand, #3a8dc9);
}

.collapse-card.expanded .collapse-card__arrow::after {
  transform: rotate(-135deg) translateY(-1px);
  border-color: #fff;
}

/* ===== 正文区（CSS Grid 折叠动画） ===== */
.collapse-card__body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.35s cubic-bezier(0.4,0,0.2,1);
}

.collapse-card.expanded .collapse-card__body {
  grid-template-rows: 1fr;
}

/* 展开区顶部淡入分割线 — 放在 content 上避免成为 grid 子元素 */
.collapse-card__content {
  min-height: 0;
  overflow: hidden;
  padding: 0 20px 0 48px;
  opacity: 0;
  font-size: 0.9rem;
  color: var(--vp-c-text-2, #6b6b7b);
  line-height: 1.8;
  user-select: text;
  border-top: 1px solid transparent;
  transition: opacity 0.2s 0.1s ease, padding 0.35s ease, border-color 0.3s;
}

.collapse-card.expanded .collapse-card__content {
  padding: 14px 20px 20px 48px;
  opacity: 1;
  border-color: var(--vp-c-border, #e8e8ed);
}

/* 正文保持 Markdown 原样，只保留基础间距 + 代码块/表格兼容 */
.collapse-card__content :deep(p),
.collapse-card__content :deep(ul),
.collapse-card__content :deep(ol) {
  margin: 0.5em 0;
}

.collapse-card__content :deep(pre) {
  margin: 0.75em 0;
  padding: 14px 16px;
  border-radius: 8px;
  background: var(--vp-c-bg-mute, #f0f0f5);
  overflow-x: auto;
  font-size: 0.85em;
  line-height: 1.6;
}

.collapse-card__content :deep(code) {
  font-family: var(--vp-font-mono, 'Fira Code', 'Consolas', monospace);
  font-size: 0.88em;
}

.collapse-card__content :deep(:not(pre) > code) {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--vp-c-bg-mute, #f0f0f5);
  color: var(--vp-c-brand-dark, #2c6f9e);
}

.collapse-card__content :deep(table) {
  width: 100%;
  margin: 0.75em 0;
  border-collapse: collapse;
  font-size: 0.9em;
}

.collapse-card__content :deep(th),
.collapse-card__content :deep(td) {
  padding: 8px 12px;
  border: 1px solid var(--vp-c-border, #e4e4e9);
  text-align: left;
}

.collapse-card__content :deep(th) {
  background: var(--vp-c-bg-soft, #f6f6f8);
  font-weight: 600;
}
</style>
