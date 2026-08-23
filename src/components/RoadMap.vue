<template>
    <div class="w-full">
      <div class="relative flex min-h-screen w-full">
        <div 
          v-if="isMobile && open" 
          @click="closeSidebar()" 
          class="fixed inset-0 bg-black/40 z-50 lg:hidden"
        ></div>

        <aside
          :class="[
            'bg-white border-gray-200 transition-all duration-300 z-50 flex flex-col justify-between overflow-hidden',
            'fixed top-0 bottom-0 left-0 w-80 shadow-2xl h-screen',
            open ? 'translate-x-0' : '-translate-x-full',
            'lg:sticky lg:top-0 lg:bottom-auto lg:shadow-none lg:translate-x-0 lg:h-screen',
            open ? 'lg:w-80 lg:border-r' : 'lg:w-0 lg:border-r-0'
          ]"
        >
          <div class="p-4 flex flex-col gap-4 w-80 translate-x overflow-y-auto overscroll-contain h-full">
            <div class="mb-4">
              <h2 class="tracking-widest text-sm font-inter text-gray-500">FILTERS</h2>
            </div>
  
            <div class="flex-1">
              <div class="flex flex-col gap-6">
                <div class="flex flex-col gap-2">
                  <label for="department" class="text-sm font-semibold text-gray-700">DEPARTMENT</label>
                  <Select
                    id="department"
                    :options="departments"
                    v-model="selectedDepartment"
                    option-label="label"
                    option-value="value"
                    append-to="self"
                    placeholder="Select your Department"
                    class="w-full border border-gray-300 text-gray-600"
                  />
                </div>
  
                <div class="flex flex-col gap-2">
                  <label for="semester" class="text-sm font-semibold text-gray-700">SEMESTER</label>
                  <Select
                    id="semester"
                    :options="semesters"
                    v-model="selectedSemester"
                    option-label="label"
                    option-value="value"
                    append-to="self"
                    placeholder="Select your Semester"
                    class="w-full border border-gray-300 text-gray-600"
                  />
                </div>
  
                <div class="flex flex-col gap-2">
                  <label class="text-sm font-semibold text-gray-700">REGULATION</label>
                  <div class="flex items-center justify-start ps-3">
                    <div class="flex flex-col gap-3">
                      <div class="flex items-center gap-3" v-for="rc in regulationCodes" :key="rc.value">
                        <RadioButton v-model="selectedRegulationCode" :input-id="rc.label" :name="rc.label" :value="rc.value" />
                        <label :for="rc.label" class="text-sm text-gray-700 cursor-pointer">{{ rc.value }}</label>
                      </div>
                    </div>
                  </div>
                </div>
  
                <div class="flex flex-col gap-2">
                  <label for="subject" class="text-sm font-semibold text-gray-700">SUBJECT</label>
                  <Select 
                    id="subject"
                    :options="subjects"
                    v-model="selectedSubject"
                    option-label="name"
                    append-to="self"
                    placeholder="Select a Subject"
                    class="w-full border border-gray-300 text-gray-600"
                  >
                    <template #option="slotProps">
                      <div class="whitespace-normal wrap-break-word max-w-full">
                        {{ slotProps.option.name }}
                      </div>
                    </template>
                  </Select>
                </div>
  
                <div class="mt-2">
                  <Button class="p-ripple w-full cursor-pointer bg-sky-800 border-sky-800 text-white" @click="applyFilterOnSubjects()">
                    APPLY FILTER
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </aside>
  
        <!-- Main Content -->
        <main
          class="flex-1 min-w-0 transition-all duration-300 ease-in-out"
          :class="isMobile ? 'w-full px-4' : open ? 'px-6' : 'px-[20%]'"
        >
          <header class="mb-3 z-30 mx-auto max-w-6xl">
            <Button severity="secondary" text size="small" @click="open = !open" class="p-ripple flex items-center gap-2 border-gray-300 ms-1 mt-4 bg-white">
              <h4 class="text-sky-700 text-sm">FILTERS</h4>
              <span class="pi pi-filter text-sky-700 text-sm"></span>
            </Button>
            <div class="flex flex-col gap-2 ml-3 mt-3">
              <h1 class="font-bold text-2xl text-primary-dark tracking-wide">{{ headerSubject?.name }}</h1>
              <h3 class="text-gray-500">#{{ headerSubject?.subject_code }}</h3>
            </div>
          </header>
  
          <div>
  
            <div class="max-w-6xl mx-auto p-6 min-h-screen">
              <div class="p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 z-20 backdrop-blur-md bg-white/90">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h1 class="text-lg tracking-wide font-bold text-gray-800">Syllabus Completion Tracker</h1>
                    <p class="text-xs text-gray-500 mt-0.5">
                      {{ completedCount }} of {{ totalTopicsCount }} topics completed ({{ progressPercentage }}%)
                    </p>
                  </div>
                  <Button 
                    label="Reset Progress" 
                    icon="pi pi-refresh" 
                    severity="secondary" 
                    outlined 
                    size="small"
                    class="p-button-sm self-start sm:self-auto"
                    @click="resetProgress" 
                  />
                </div>
  
                <ProgressBar :value="progressPercentage" :showValue="true" style="height: 12px" />
              </div>
  
              <div class="space-y-10 flex flex-col gap-y-24">
                <div 
                  v-for="(unit, i) in units" 
                  :key="unit.id" 
                  class=""
                >
                  <div class="flex items-center justify-between mb-6 pb-3 border-b border-gray-300">
                    <div class="flex items-center gap-3">
                      <h2 class="text-xl font-extrabold text-primary">
                        <span class="pi pi-dot text-primary scale-200"></span>
                        {{ unit.title }}</h2>
                    </div>
                    <span class="text-xs font-medium text-gray-500">
                      {{ getUnitCompletedCount(unit) }} / {{ unit.topics.length }} Done
                    </span>
                  </div>
  
                  <Timeline :value="unit.topics" :align="isMobile ? ((i%2 === 0) ? 'left' : 'right'): 'alternate'" class="custom-timeline">
                    <template #content="slotProps">
                      <div 
                        class="py-4 min-w-70 rounded-lg border transition-all duration-200 my-2 shadow-sm"
                        :class="[
                          slotProps.item.completed 
                            ? 'bg-emerald-50/60 border-emerald-300 shadow-emerald-50' 
                            : 'bg-white border-gray-200 hover:border-primary-400 hover:shadow-md'
                        ]"
                      >
                        <div class="flex items-start gap-3 px-3">
                          <Checkbox 
                            v-model="slotProps.item.completed" 
                            :binary="true" 
                            :inputId="String(slotProps.item.id)"
                            class="mt-0.5"
                          />
                          <div class="flex justify-between flex-1">
                            <label 
                              :for="String(slotProps.item.id)" 
                              class="text-md font-semibold cursor-pointer select-none text-left transition-colors"
                              :class="slotProps.item.completed ? 'line-through text-gray-400' : 'text-gray-800'"
                            >
                              {{ slotProps.item.name }}
                            </label>
                            <span v-if="slotProps.item.weightage" class="text-xs text-amber-600 font-medium mt-1">
                              {{ slotProps.item.weightage }}
                            </span>
                            <Button @click="goToQuestionsPage(slotProps.item.id)" unstyled class="group flex gap-1 pe-2 hover:text-tertiary flex-nowrap cursor-pointer text-[12px] items-center rounded-xl px-2">
                              questions
                              <span class="pi pi-arrow-right text-xs group-hover:translate-x-1.25 transition-transform duration-300"></span>
                            </Button>
                          </div>
                        </div>
  
                        <div class="flex justify-between gap-4 mt-3 mx-5">
                          <button 
                            @click="openAiDescription(slotProps.item)"
                            class="flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-900 cursor-pointer"
                          >
                            <i class="pi pi-sparkles text-xs"></i> AI description
                          </button>
                          <button 
                            @click="searchGoogle(slotProps.item.name)"
                            class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            <i class="pi pi-search text-xs"></i> Google
                          </button>
                        </div>
                      </div>
                    </template>
                  </Timeline>
                </div>
              </div>
            </div>
          </div>
        </main>
  
        <Dialog 
          v-model:visible="aiDialogVisible" 
          :header="activeTopic?.name" 
          modal
          :style="{ width: '90vw', maxWidth: '42rem' }"
        >
          <div v-if="aiLoading" class="flex flex-col gap-3 py-2">
            <Skeleton height="1rem" width="90%" />
            <Skeleton height="1rem" width="75%" />
            <Skeleton height="1rem" width="60%" />
          </div>
  
          <div v-else-if="aiError" class="text-sm text-red-600 py-2">
            Couldn't load this right now.
            <button @click="fetchAiDescription(activeTopic)" class="underline font-semibold ml-1">Retry</button>
          </div>
  
          <div v-else-if="aiData" class="flex flex-col gap-4 py-2">
            <p class="text-sm text-gray-700 leading-relaxed">{{ aiData.summary }}</p>
  
            <ul v-if="aiData.key_points?.length" class="flex flex-col gap-2">
              <li v-for="(point, i) in aiData.key_points" :key="i" class="flex items-start gap-2 text-sm text-gray-700">
                <i class="pi pi-check text-emerald-600 text-xs mt-1"></i>
                <span>{{ point }}</span>
              </li>
            </ul>
  
            <div v-if="aiData.table" class="overflow-x-auto">
              <table class="w-full text-xs border-collapse">
                <thead>
                  <tr class="border-b border-gray-200">
                    <th v-for="(col, i) in aiData.table.columns" :key="i" class="text-left py-1.5 pr-3 text-gray-500 font-semibold">{{ col }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, i) in aiData.table.rows" :key="i" class="border-b border-gray-100">
                    <td v-for="(cell, j) in row" :key="j" class="py-1.5 pr-3 text-gray-700">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
  
            <div v-if="aiData.mermaid_diagram" ref="mermaidContainer" class="mermaid-wrapper overflow-x-auto my-2"></div>
  
            <div v-if="aiData.exam_tip" class="flex items-start gap-2 bg-amber-50 text-amber-700 text-xs rounded-lg px-3 py-2">
              <i class="pi pi-flag mt-0.5"></i>
              <span>{{ aiData.exam_tip }}</span>
            </div>
          </div>
        </Dialog>
      </div>
    </div>
  </template>
  
  <script setup>
  import { onBeforeUnmount, onMounted, ref, watch, computed, nextTick } from 'vue'
  import { useSubjectStore } from '@/stores/subject.js'
  
  import Select from 'primevue/select'
  import Button from 'primevue/button'
  import RadioButton from 'primevue/radiobutton'
  import Timeline from 'primevue/timeline'
  import Checkbox from 'primevue/checkbox'
  import ProgressBar from 'primevue/progressbar'
  import Dialog from 'primevue/dialog'
  import Skeleton from 'primevue/skeleton'
  import mermaid from 'mermaid'
  import { useRouter } from 'vue-router'
  
  mermaid.initialize({ startOnLoad: false })
  
  const router = useRouter()
  const subjectStore = useSubjectStore()
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  
  const selectedDepartment = ref(subjectStore.filters.department || 'CSE')
  const selectedSemester = ref(subjectStore.selectedSubject?.semester || 5)
  const selectedRegulationCode = ref(subjectStore.filters.regulation_code || 'R22')
  const selectedSubject = ref(subjectStore.selectedSubject)
  const headerSubject = ref(subjectStore.selectedSubject)
  
  const loading = ref(false)
  const subjects = ref([])
  const rawTopics = ref([])
  const units = ref([])
  
  const checkInitialMobile = () => typeof window !== 'undefined' && window.innerWidth < 1024
  const isMobile = ref(checkInitialMobile())
  const open = ref(!checkInitialMobile())
  
  let mql = null
  let onMqlChange = null
  
  const aiDialogVisible = ref(false)
  const aiLoading = ref(false)
  const aiError = ref(false)
  const aiData = ref(null)
  const activeTopic = ref(null)
  const mermaidContainer = ref(null)
  
  const regulationCodes = ref([
    { label: 'R22A', value: 'R22A' },
    { label: 'R22', value: 'R22' },
    { label: 'R20', value: 'R20' },
    { label: 'R18', value: 'R18' },
  ])
  
  const departments = ref([
    { label: 'AI&DS', value: 'AI&DS' },
    { label: 'AI&ML', value: 'AI&ML' },
    { label: 'Biotech', value: 'Biotech' },
    { label: 'CET', value: 'CET' },
    { label: 'Chemical', value: 'Chem' },
    { label: 'Civil', value: 'Civil' },
    { label: 'CSE', value: 'CSE' },
    { label: 'CSM', value: 'CSE-AI&ML' },
    { label: 'ECE', value: 'ECE' },
    { label: 'EEE', value: 'EEE' },
    { label: 'IT', value: 'IT' },
    { label: 'Mechanical', value: 'Mech' },
  ])
  
  const semesters = ref([
    { label: 1, value: 1 },
    { label: 2, value: 2 },
    { label: 3, value: 3 },
    { label: 4, value: 4 },
    { label: 5, value: 5 },
    { label: 6, value: 6 },
    { label: 7, value: 7 },
    { label: 8, value: 8 },
  ])
  
  async function openAiDescription(topic) {
    activeTopic.value = topic
    aiDialogVisible.value = true
    await fetchAiDescription(topic)
  }
  
  async function fetchAiDescription(topic) {
    if (!topic?.id) return
    aiLoading.value = true
    aiError.value = false
    aiData.value = null
    try {
      const res = await fetch(`${baseUrl}/api/topics/${topic.id}/ai-description`)
      if (!res.ok) throw new Error('Request failed')
      aiData.value = await res.json()
      if (aiData.value.mermaid_diagram) {
        await nextTick()
        if (mermaidContainer.value) {
          mermaidContainer.value.innerHTML = '' 
          const { svg } = await mermaid.render(`diagram-${topic.id}-${Date.now()}`, aiData.value.mermaid_diagram)
          mermaidContainer.value.innerHTML = svg
        }
      }
    } catch (err) {
      console.error('AI Description error:', err)
      aiError.value = true
    } finally {
      aiLoading.value = false
    }
  }
  async function loadAllSubjects() {
  loading.value = true
  try {
    const subjectsRes = await fetch(`${baseUrl}/api/subjects/${selectedDepartment.value}/${selectedSemester.value}/${selectedRegulationCode.value}`)
    if (!subjectsRes.ok) throw new Error('API Connection failed')
    
    const data = await subjectsRes.json()
    subjects.value = data

    if (data.length > 0) {
      if (selectedSubject.value?.id) {
        const matched = data.find(s => Number(s.id) === Number(selectedSubject.value.id))
        selectedSubject.value = matched || data[0]
      } else {
        selectedSubject.value = data[0]
      }
    } else {
      selectedSubject.value = null
    }

    if(units.value.length === 0) await loadTopics()
  } catch (error) {
    console.error('Failed loading subjects:', error)
    subjects.value = []
    selectedSubject.value = null
    headerSubject.value = null
  } finally {
    loading.value = false
  }
}
  
  async function loadTopics() {
    const subjectId = selectedSubject.value?.id
    const numericSubjectId = Number(subjectId)
  
    if (!subjectId || isNaN(numericSubjectId)) {
      rawTopics.value = []
      units.value = []
      return
    }
    loading.value = true
    try {
      const response = await fetch(`${baseUrl}/api/topics/${numericSubjectId}`)
      if (response.status === 404) {
        rawTopics.value = []
        units.value = []
      } else if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
      } else {
        rawTopics.value = await response.json()
        units.value = convertToTree(rawTopics.value)
      }
    } catch (error) {
      console.error('Failed to load topics:', error)
      rawTopics.value = []
      units.value = []
    } finally {
      loading.value = false
    }
  }
  
  const convertToTree = (topicsList) => {
  const unitsMap = new Map()
  const storedIds = new Set(subjectStore.filters.completedTopicIds.map(String))

  topicsList.forEach((topic) => {
    const unitNum = topic.unit || 1
    const unitKey = `unit-${unitNum}`

    if (!unitsMap.has(unitKey)) {
      unitsMap.set(unitKey, {
        id: unitKey,
        number: `Unit ${unitNum}`,
        title: topic.unit_title || `Unit ${unitNum}`,
        topics: []
      })
    }

    const topicIdStr = String(topic.id)

    unitsMap.get(unitKey).topics.push({
      id: topicIdStr,
      name: topic.topic || topic.name,
      //weightage: topic.weightage || '',
      completed: storedIds.has(topicIdStr) || Boolean(topic.completed)
    })
  })

  return [...unitsMap.values()]
}
watch(
  units,
  (newUnits) => {
    const activeCompletedIds = []
    newUnits.forEach(unit => {
      unit.topics?.forEach(topic => {
        if (topic.completed) {
          activeCompletedIds.push(String(topic.id))
        }
      })
    })
    subjectStore.setCompletedTopicIds(activeCompletedIds)
  },
  { deep: true }
)
  
async function applyFilterOnSubjects() {
  if (!selectedSubject.value) { 
    rawTopics.value = []
    units.value = []
    return
  }
  
  headerSubject.value = selectedSubject.value
  
  subjectStore.selectSubject(selectedSubject.value)
  subjectStore.filters.department = selectedDepartment.value
  subjectStore.filters.semester = selectedSemester.value
  subjectStore.filters.regulation_code = selectedRegulationCode.value

  await loadTopics()
  
  if (isMobile.value) {
    open.value = false
  }
  scrollToTop()
}
  
  watch([selectedDepartment, selectedRegulationCode, selectedSemester], () => {
    loadAllSubjects()
  })

  onMounted(async () => {
  if (typeof window === 'undefined') return

  mql = window.matchMedia('(max-width: 1023px)')
  isMobile.value = mql.matches
  open.value = !isMobile.value

  onMqlChange = (event) => {
    isMobile.value = event.matches
    open.value = !event.matches
  }
  mql.addEventListener('change', onMqlChange)

  await loadAllSubjects()
  if (selectedSubject.value) {
    headerSubject.value = selectedSubject.value
  }
})

onBeforeUnmount(() => {
  if (mql && onMqlChange) {
    mql.removeEventListener('change', onMqlChange)
  }
})
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  function closeSidebar() {
    open.value = false
    selectedSubject.value = headerSubject.value
  }
  
  const totalTopicsCount = computed(() => {
    return units.value.reduce((acc, u) => acc + (u.topics?.length || 0), 0)
  })
  
  const completedCount = computed(() => {
    return units.value.reduce((acc, u) => {
      return acc + (u.topics?.filter(t => t.completed).length || 0)
    }, 0)
  })
  
  const progressPercentage = computed(() => {
    if (totalTopicsCount.value === 0) return 0
    return Math.round((completedCount.value / totalTopicsCount.value) * 100)
  })
  
  const getUnitCompletedCount = (unit) => {
    return unit.topics?.filter(t => t.completed).length || 0
  }
  
  const resetProgress = () => {
  units.value.forEach(unit => {
    unit.topics?.forEach(topic => {
      topic.completed = false
    })
  })
  subjectStore.resetCompletedTopics()
}
  
  function searchGoogle(topicName) {
    const subjectName = selectedSubject.value?.name || ''
    const query = encodeURIComponent(`${topicName} in ${subjectName}`)
    window.open(`https://www.google.com/search?q=${query}`, '_blank')
  }

  function goToQuestionsPage(topicId){
      subjectStore.filters.topicId = topicId
      router.push({name: 'questions', params: {subjectId: selectedSubject.value.id}})
  }
  </script>
  
  <style scoped>
  :deep(.custom-timeline .p-timeline-event-opposite) {
    flex: 1;
  }
  :deep(.custom-timeline .p-timeline-event-content) {
    flex: 1;
  }
  </style>