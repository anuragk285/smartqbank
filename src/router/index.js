import { createRouter, createWebHistory } from 'vue-router'
import SubjectView from '@/components/SubjectView.vue'
import QuestionView from '@/components/QuestionView.vue'
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
    }
  ]
})

export default router