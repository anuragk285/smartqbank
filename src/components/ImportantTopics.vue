<template>
    <div class="">
        <div class="flex flex-col gap-3 mx-auto my-6"
            :class="isMobile ? 'w-full' : (open ? 'w-full max-w-[95ch]' : 'w-full max-w-[105ch]')">
            <div class="flex flex-row flex-wrap justify-between">
                <div>
                    <h2 class="ms-4 text-2xl tracking-wide text-primary font-bold">Important Topics</h2>
                    <h4 class="ms-4 text-gray-500 text-sm tracking-wide">{{ selectedSubject?.name }} ⋅ #{{ selectedSubject?.subject_code }}</h4>
                </div>
                <SelectButton :disabled="currentRegulation === 'R22A'" class="mx-4 mt-4" size="small" v-model="selectedRegulation" :options="regulationOptions" optionLabel="label" optionValue="value" ariaLabelledby="basic" />
            </div>
            <div>
                <div class="overflow-x-auto [-webkit-overflow-scrolling:touch]">
                    <div class="grid grid-cols-24 gap-x-1 sm:gap-x-2 px-4 py-2 font-semibold text-tertiary text-sm min-w-140px">
                        <span class="col-span-2">RANK</span>
                        <span class="col-span-11 ms-4 sm:m-0">Topic Name</span>
                        <span class="col-span-6 text-center">Consistency</span>
                        <span class="col-span-5">Avg marks per paper</span>
                    </div>
                </div>
                <div v-if="loading">
                    <Accordion>
                        <AccordionPanel v-for="n in 10" :key="n">
                            <AccordionHeader>
                                <div class="grid grid-cols-24 gap-2 w-full items-center pr-4">
                                    <Skeleton width="1rem" height="1rem" class="col-span-2 bg-gray-200"></Skeleton>
                                    <Skeleton width="8rem" height="1rem" class="col-span-11 bg-gray-200"></Skeleton>
                                    <Skeleton width="3rem" height="1rem" class="col-span-6 mx-auto bg-gray-200"></Skeleton>
                                    <Skeleton width="4rem" height="1rem" class="col-span-5 mx-auto bg-gray-200"></Skeleton>
                                </div>
                            </AccordionHeader>
                        </AccordionPanel>
                    </Accordion>
                </div>
                <Accordion v-else v-model:value="activePanel">
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
                                <div v-if="loadingTopics[topic.topic]" class="py-2">
                                    <div
                                        v-for="n in 2"
                                        :key="n"
                                        class="mx-auto my-2 px-4 py-6 min-h-32 border border-gray-300 rounded-xl flex flex-col gap-3 justify-between"
                                        :class="isMobile ? 'w-full' : open ? 'w-[85ch]' : 'w-[95ch]'"
                                    >
                                        <div class="flex flex-wrap justify-between items-center gap-3">
                                        <div class="flex gap-2 items-center">
                                            <Skeleton width="4rem" height="1rem" class="bg-gray-200" />
                                            <span class="text-gray-300">⋅</span>
                                            <Skeleton width="4rem" height="1rem" class="bg-gray-200" />
                                            <span class="text-gray-300">⋅</span>
                                            <Skeleton width="10rem" height="1rem" class="bg-gray-200" />
                                        </div>
                                        <div class="flex gap-3">
                                            <Skeleton width="3rem" height="1.25rem" class="rounded-md bg-gray-200" />
                                            <Skeleton width="3rem" height="1.25rem" class="rounded-md bg-gray-200" />
                                        </div>
                                        </div>
                                        <div class="flex flex-col gap-2 mx-2 mb-1">
                                        <Skeleton width="100%" height="1.25rem" class="bg-gray-200" />
                                        <Skeleton width="4rem" height="1rem" class="bg-gray-200" />
                                        </div>
                                    </div>            
                                </div>
                                <QuestionCard
                                    class="py-2 mx-auto"
                                    v-for="q in topicQuestions[topic.topic]?.[selectedRegulation]"
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

                                <p v-if="topicQuestions[topic.topic]?.[selectedRegulation] && topicQuestions[topic.topic]?.[selectedRegulation].length === 0" class="text-surface-500 py-2">
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
    //import ToggleSwitch from 'primevue/toggleswitch';
    import SelectButton from 'primevue/selectbutton';
    import Skeleton from 'primevue/skeleton';
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
    const topics = ref([])
    const checkInitialMobile = () => typeof window !== 'undefined' && window.innerWidth < 1024
    const isMobile = ref(checkInitialMobile())
    const open = ref(!checkInitialMobile())
    const topicQuestions = ref({});
    const loadingTopics = ref({})
    const papers_analyzed = ref(0);
    const activePanel = ref(null)
    const currentRegulation = ref(subjectStore.filters.regulation_code)
    const selectedRegulation = ref('all');
    const regulationOptions = ref([
        {label: currentRegulation, value: currentRegulation},
        {label: 'ALL', value: 'all'}
    ])
    onMounted(async () => {
        loading.value = true
        await loadTopics()
        loading.value = false
    });

    watch(activePanel, (newIndex) => {
        if (newIndex === null || newIndex === undefined) return
        const topic = topics.value[newIndex]
        if (topic) showQuestions(topic)
    })
    watch(selectedRegulation, async (newValue) => {
        if(newValue === null || newValue === undefined) return
        await loadTopics()
    })
    const loadTopics = async () => {
        loading.value = true
        const numericSubjectId = subjectId.value
        try {
            const params = new URLSearchParams({crossRegulation: selectedRegulation.value === 'all' ? true : false})
            const response = await fetch(`${baseUrl}/api/topics/${numericSubjectId}/important-topics?${params}`)
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
    };

    async function loadSelectedTopicQuestions(topic) {
        const topicKey = topic.topic;
        loadingTopics.value[topicKey] = true;
        const params = new URLSearchParams();
        if(!topicQuestions.value[topicKey]){
            topicQuestions.value[topicKey] = {}
        }
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
            topicQuestions.value[topicKey] = {
            ...topicQuestions.value[topicKey],
            [selectedRegulation.value]: data
        }; 
        } catch (error) {
            console.error("Failed to load topic questions:", error);
        } finally {
            loadingTopics.value[topicKey] = false;
        }
    }

async function showQuestions(topic) {
    // Optional optimization: only fetch if we haven't already fetched for this topic
    if (!topicQuestions.value[topic.topic]?.[selectedRegulation.value]) {
        await loadSelectedTopicQuestions(topic);
    }
}
</script>

