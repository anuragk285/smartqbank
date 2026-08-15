<template>
    <div class="">
        <div class="flex flex-col gap-3 mx-auto my-6"
    :class="isMobile ? 'w-full' : (open ? 'w-full max-w-[95ch]' : 'w-full max-w-[105ch]')">
    <h2 class="ms-4 text-2xl tracking-wide text-primary font-bold">Important Topics</h2>
    <h4 class="ms-4 text-gray-500 text-sm tracking-wide">{{ selectedSubject?.name }} ⋅ #{{ selectedSubject?.subject_code }}</h4>
    
    <div>
        <div class="grid grid-cols-12 gap-1 sm:gap-2 px-4 py-2 font-semibold text-tertiary text-sm">
            <span class="col-span-6">Topic Name</span>
            <span class="col-span-2">Years Appeared</span>
            <span class="col-span-2">Question Count</span>
            <span class="col-span-2">Avg marks per paper</span>
        </div>

        <Accordion>
            <AccordionPanel v-for="(topic, i) in topics" :key="i" :value="i">
                <AccordionHeader @click="showQuestions(topic)" class="hover:bg-gray-100">
                    <div class="grid grid-cols-12 gap-2 w-full items-center pr-4">
                        <span class="col-span-6 hover:text-primary-dark font-medium text-start">{{ topic.topic }}</span>
                        <span class="col-span-2 text-sm text-gray-500 hover:text-primary-dark text-center">{{ topic.years_appeared || '0' }} / {{ papers_analyzed }}</span>
                        <span class="col-span-2 text-sm text-gray-500 hover:text-primary-dark text-center">{{ topic.question_count || '-' }}</span>
                        <span class="col-span-2 text-sm text-gray-500 hover:text-primary-dark text-center">{{ topic.avg_marks_per_paper || '-' }}</span>
                    </div>
                </AccordionHeader>
                
                <AccordionContent class="">
                    <div>
                        <p v-if="loadingTopics[topic.topic]" class="text-gray-500 py-2">Loading questions...</p>
                        <QuestionCard
                            class="sm:p-2 py-2 mx-auto"
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
    import { ref, onMounted, computed } from 'vue';
    import Accordion from 'primevue/accordion';
    import AccordionPanel from 'primevue/accordionpanel';
    import AccordionContent from 'primevue/accordioncontent';
    import AccordionHeader from 'primevue/accordionheader';
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

