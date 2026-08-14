<template>
    <div class="grid w-full grid-cols-24">
        <div class="col-span-7 border-r border-gray-300">
            <h2 class="text-md text-gray-500 tracking-widest font-medium mt-4 ms-4">Topics</h2>
            <div class="m-4">
                <Menu :model="menuItems" v-model="selectedTopic"> 
                    <template #item="{ label, weightage_percent}">
                        <div class="flex justify-between px-2 py-1 cursor-pointer">
                            <span>{{ label }}</span>
                            <span>{{ weightage_percent }}</span>
                        </div>
                    </template>
                </Menu>
            </div>
        </div>
        <div class="col-span-17 m-4">
            <div class="flex flex-col gap-3 "
            :class="isMobile ? 'w-full' : (open ? 'w-full max-w-[85ch]' : 'w-full max-w-[95ch]')">
                <h2 class="text-2xl tracking-wide text-primary font-bold">Quick Preparation</h2>
                <h4 class="text-gray-500 text-sm tracking-wide">{{ selectedSubject?.name }} ⋅ #{{ selectedSubject?.subject_code }}</h4>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { useSubjectStore } from '@/stores/subject';
    import { storeToRefs } from 'pinia'
    import { ref, onMounted, computed } from 'vue';
    // import DataTable from 'primevue/datatable';
    // import Column from 'primevue/column';
    import Menu from 'primevue/menu';
    import { useRoute } from 'vue-router';

    const baseUrl = import.meta.env.VITE_API_BASE_URL
    const route = useRoute()
    const loading = ref(false)
    const subjectStore = useSubjectStore()
    const { selectedSubject } = storeToRefs(subjectStore)
    const subjectId = computed(() => Number(route.params.subjectId))
    const selectedTopic = ref('')
    const topics = ref([])
    const checkInitialMobile = () => typeof window !== 'undefined' && window.innerWidth < 1024
    const isMobile = ref(checkInitialMobile())
    const open = ref(!checkInitialMobile())
    const menuItems = ref([])
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
            topics.value = await response.json()
            }
        } catch (error) {
            console.log('Failed to load topics:', error)
            topics.value = []
        }
        loading.value = false
        // Map the response to PrimeVue MenuItem format
        menuItems.value = topics.value.map(item => ({
            label: item.topic,              // PrimeVue needs this for the text
            icon: 'pi pi-book',             // Optional: Add a PrimeIcon
            data: item,                     // Store the original backend object here
            command: () => {
                console.log(`You clicked ${item.topic} which has ${item.total_marks} marks.`);
            }
        }));
    };
</script>

