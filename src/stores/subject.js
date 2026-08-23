import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSubjectStore = defineStore('subject', () => {
  const selectedSubject = ref(null) 

  const filters = ref({
    department: 'CSE',
    semester: 5,
    regulation_code: 'R22',
    topicId: -1
  })

  function selectSubject(subject) {
    selectedSubject.value = subject
  }

  function clearSubject() {
    selectedSubject.value = null
  }

  return { selectedSubject, selectSubject, clearSubject, filters }
},
{persist: true})