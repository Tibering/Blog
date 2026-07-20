import { defineClientConfig } from 'vuepress/client'
// import RepoCard from 'vuepress-theme-plume/features/RepoCard.vue'
// import NpmBadge from 'vuepress-theme-plume/features/NpmBadge.vue'
// import NpmBadgeGroup from 'vuepress-theme-plume/features/NpmBadgeGroup.vue'
// import Swiper from 'vuepress-theme-plume/features/Swiper.vue'

// import CustomComponent from './theme/components/Custom.vue'

import './theme/styles/click-spark.css'

export default defineClientConfig({
  enhance({ app }) {
    // built-in components
    // app.component('RepoCard', RepoCard)
    // app.component('NpmBadge', NpmBadge)
    // app.component('NpmBadgeGroup', NpmBadgeGroup)
    // app.component('Swiper', Swiper) // you should install `swiper`

    // your custom components
    // app.component('CustomComponent', CustomComponent)
  },
  setup() {
    if (typeof document === 'undefined') return

    const SPARK_COLOR = '#e01313'
    const SPARK_SIZE = 14
    const SPARK_RADIUS = 23
    const SPARK_COUNT = 7
    const DURATION = 400
    const EXTRA_SCALE = 0.6

    document.addEventListener('click', (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e

      for (let i = 0; i < SPARK_COUNT; i++) {
        const angle = (Math.PI * 2 * i) / SPARK_COUNT + Math.random() * 0.5
        const distance = SPARK_RADIUS * (0.6 + Math.random() * 0.4)
        const sx = Math.cos(angle) * distance
        const sy = Math.sin(angle) * distance

        const spark = document.createElement('div')
        spark.className = 'click-spark'
        spark.style.cssText = `
          left: ${x - SPARK_SIZE / 2}px;
          top: ${y - SPARK_SIZE / 2}px;
          width: ${SPARK_SIZE}px;
          height: ${SPARK_SIZE}px;
          background: ${SPARK_COLOR};
          --sx: ${sx}px;
          --sy: ${sy}px;
          --es: ${EXTRA_SCALE};
          animation-duration: ${DURATION}ms;
        `

        document.body.appendChild(spark)
        spark.addEventListener('animationend', () => spark.remove())
      }
    })
  },
})
