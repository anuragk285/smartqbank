<template>
    <div class="">
        <div class="flex flex-col gap-3 mx-auto my-6"
            :class="isMobile ? 'w-full' : (open ? 'w-full max-w-[95ch]' : 'w-full max-w-[105ch]')">
            <div class="flex sm:flex-row flex-col justify-between">
                <div>
                    <h2 class="ms-4 text-2xl tracking-wide text-primary font-bold">Important Topics</h2>
                    <h4 class="ms-4 text-gray-500 text-sm tracking-wide">{{ selectedSubject?.name }} ⋅ #{{ selectedSubject?.subject_code }}</h4>
                </div>
                <div>
                    <label class="inline-flex items-center cursor-pointer">
                        <input type="checkbox" value="" class="sr-only peer"/>
                        <span class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">Check similar Topics over previous regulations</span>
                        <div class="relative w-11 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>
            <div>
                <!-- column header labels -->
                <div class="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                    <div class="grid grid-cols-24 gap-x-1 sm:gap-x-2 px-4 py-2 font-semibold text-tertiary text-sm min-w-140px">
                        <span class="col-span-2">RANK</span>
                        <span class="col-span-11 ms-4 sm:m-0">Topic Name</span>
                        <span class="col-span-6 text-center">Consistency</span>
                        <span class="col-span-5">Avg marks per paper</span>
                    </div>
                </div>

                <Accordion v-model:value="activePanel" class="">
                    <AccordionPanel v-for="(topic, i) in topics" :key="i" :value="i">
                        <AccordionHeader class="hover:bg-gray-100 overflow-x-scroll [-webkit-overflow-scrolling:touch]">
                            <div class="grid grid-cols-24 gap-2 w-full items-center pr-4">
                                <span class="col-span-2 text-tertiary font-medium text-start">{{ i+1 }}</span>
                                <span class="col-span-11 hover:text-primary-dark font-medium text-start truncate">{{ topic.topic }}</span>
                                <div class="col-span-6 flex items-center justify-center">
                                    <div class="flex gap-1.5 items-center sm:ms-6 h-full">
                                        <div class="w-2 h-2 rounded-full bg-gray-700" v-for="y in Number(topic.years_appeared || 0)" :key="'filled-'+y"></div>
                                        <div class="w-2 h-2 rounded-full bg-gray-300" v-for="y in Number(papers_analyzed - (topic.years_appeared || 0))" :key="'empty-'+y"></div>
                                    </div>
                                </div>
                                <div class="col-span-5 text-sm text-gray-600 hover:text-primary-dark flex justify-center items-center gap-2">
                                <span>{{topic.avg_marks_per_paper}} / 60</span><ProgressBar :value="(topic.avg_marks_per_paper / 60)*100" :showValue="false" :pt="{root: 'h-2.5! w-15! rounded', value: 'bg-secondary'}"></ProgressBar>
                                </div>
                            </div>
                        </AccordionHeader>
                        
                        <AccordionContent class="">
                            <div class="">
                                <p v-if="loadingTopics[topic.topic]" class="text-gray-500 py-2">Loading questions...</p>
                                <QuestionCard
                                    class="py-2 mx-auto"
                                    v-for="q in topicQuestions[topic.topic]"
                                    :key="q.id"
                                    :question_id="q.id"
                                    :question_text="q.text"
                                    :difficulty="q.difficulty"
                                    :marks="q.marks"
                                    :unit="q.unit"
                                    :year="q.year"
                                    :image_urls="q.image_urls"
                                    :topic="q.topic"
                                    :isMobile="isMobile"
                                    :open="open"
                                />

                                <p v-if="topicQuestions[topic.topic] && topicQuestions[topic.topic].length === 0" class="text-surface-500 py-2">
                                    No questions found for this topic.
                                </p>
                            </div>
                        </AccordionContent>
                    </AccordionPanel>
                </Accordion>        
            </div>
        </div>
    </div>
</template>

<script setup>
    import { useSubjectStore } from '@/stores/subject';
    import { storeToRefs } from 'pinia'
    import { ref, onMounted, computed, watch } from 'vue';
    import Accordion from 'primevue/accordion';
    import AccordionPanel from 'primevue/accordionpanel';
    import AccordionContent from 'primevue/accordioncontent';
    import AccordionHeader from 'primevue/accordionheader';
    import ProgressBar from 'primevue/progressbar';
    // import DataTable from 'primevue/datatable';
    // import Column from 'primevue/column';
    import { useRoute } from 'vue-router';
    import QuestionCard from './QuestionCard.vue';


    const baseUrl = import.meta.env.VITE_API_BASE_URL
    const route = useRoute()
    const loading = ref(false)
    const subjectStore = useSubjectStore()
    const { selectedSubject } = storeToRefs(subjectStore)
    const subjectId = computed(() => Number(route.params.subjectId))
    //const selectedTopic = ref('')
    const topics = ref([])
    const checkInitialMobile = () => typeof window !== 'undefined' && window.innerWidth < 1024
    const isMobile = ref(checkInitialMobile())
    const open = ref(!checkInitialMobile())
    const topicQuestions = ref({});
    const loadingTopics = ref({})
    const papers_analyzed = ref(0);
    const activePanel = ref(null)

    //const questions = ref([]);
    //const groupedTopics = computed(() => groupTopicsByUnit(topics.value));

    // async function onTopicSelect(e) {
    //     const res = await fetch(`/api/topics/${e.value}/questions`);
    //     questions.value = await res.json();
    // }

    onMounted(async () => {
        loading.value = true
        await loadTopics()
        loading.value = false
    });

    // function groupTopicsByUnit(topics) {
    //     const groups = {};
    //     for (const t of topics) {
    //         if (!groups[t.unit_number]) {
    //         groups[t.unit_number] = { label: `Unit ${t.unit_number}`, unit: t.unit_number, items: [] };
    //         }
    //         groups[t.unit_number].items.push(t);
    //     }
    //     return Object.values(groups).sort((a, b) => a.unit - b.unit);  // Unit 1, Unit 2... in order
    //     }

    watch(activePanel, (newIndex) => {
        if (newIndex === null || newIndex === undefined) return
        const topic = topics.value[newIndex]
        if (topic) showQuestions(topic)
    })
    const loadTopics = async () => {
        loading.value = true
        const numericSubjectId = subjectId.value
        try {
            const response = await fetch(`${baseUrl}/api/topics/${numericSubjectId}/important-topics`)
            if (response.status === 404) {
            topics.value = []
            } else if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`)
            } else {
            const data = await response.json()
            topics.value = data.topics
            papers_analyzed.value = data.total_papers_analyzed
            }
        } catch (error) {
            console.log('Failed to load topics:', error)
            topics.value = []
        }
        loading.value = false
        // Map the response to PrimeVue MenuItem format
        // menuItems.value = topics.value.map(item => ({
        //     label: item.topic,              // PrimeVue needs this for the text
        //     icon: 'pi pi-book',             // Optional: Add a PrimeIcon
        //     data: item,                     // Store the original backend object here
        //     command: () => {
        //         console.log(`You clicked ${item.topic} which has ${item.total_marks} marks.`);
        //     }
        // }));
    };
    async function loadSelectedTopicQuestions(topic) {
    const topicKey = topic.topic; // Unique identifier for the topic
        loadingTopics.value[topicKey] = true;

    const params = new URLSearchParams();
    if (Array.isArray(topic.topic_ids)) {
        topic.topic_ids.forEach(id => {
            params.append('topic_ids', id);
        });
    }
    
    try {
        const numericSubjectId = subjectId.value; 
        const response = await fetch(`${baseUrl}/api/subjects/${numericSubjectId}/topic-questions?${params}`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error("RAW FastAPI 422 Error Response:", errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        // Save the questions specifically for this topic key

        topicQuestions.value[topicKey] = data; 
    } catch (error) {
        console.error("Failed to load topic questions:", error);
    } finally {
        loadingTopics.value[topicKey] = false;
    }
}

async function showQuestions(topic) {
    // Optional optimization: only fetch if we haven't already fetched for this topic
    if (!topicQuestions.value[topic.topic]) {
        await loadSelectedTopicQuestions(topic);
    }
}
</script>

