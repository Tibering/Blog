<!--
  折叠卡片组容器 — 每个 CollapseCard 独占一行
  Slot:
    default - 放置若干个 CollapseCard 组件
-->
<template>
  <div class="collapse-card-group">
    <slot />
  </div>
</template>

<style scoped>
.collapse-card-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
}
</style>
