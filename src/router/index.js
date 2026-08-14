import { createRouter, createWebHistory } from 'vue-router'
import SubjectView from '@/components/SubjectView.vue'
import QuestionView from '@/components/QuestionView.vue'
import QuickPrep from '@/components/QuickPrep.vue'
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'subjects', component: SubjectView },
    {
      path: '/subjects/:subjectId/questions',
      name: 'questions',
      component: QuestionView
    },
    { path: '/subjects/:subjectId/questions/quick-prep',
      name: 'quick-prep',
      component: QuickPrep
    }
  ]
})

export default router