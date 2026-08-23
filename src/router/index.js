import { createRouter, createWebHistory } from 'vue-router'
import SubjectView from '@/components/SubjectView.vue'
import QuestionView from '@/components/QuestionView.vue'
import RoadMap from '@/components/RoadMap.vue'
import ImportantTopics from '@/components/ImportantTopics.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'subjects', component: SubjectView },
    {
      path: '/subjects/:subjectId/questions',
      name: 'questions',
      component: QuestionView
    },
    { path: '/subjects/:subjectId/questions/important-topics',
      name: 'important-topics',
      component: ImportantTopics
    },
    {path: '/roadmap', name: 'roadmap', component: RoadMap}
  ],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

export default router