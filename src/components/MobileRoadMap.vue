<template>
    <div v-if="isMobile" class="flex flex-col">
        <div 
            v-for="topic in unit.topics" :key="topic.id"
            class="py-5 min-w-70 rounded-lg border transition-all duration-200 my-3 shadow-sm"
            :class="[
                topic.completed 
                ? 'bg-emerald-50/60 border-emerald-300 shadow-emerald-50' 
                :  'border-gray-200 hover:border-primary-400 hover:shadow-md'
            ]"
            >
            <div class="flex items-start gap-3 px-3">
                <Checkbox 
                v-model="topic.completed" 
                :binary="true" 
                :inputId="String(topic.id)"
                class="mt-0.5"
                />
                <div class="flex justify-between flex-1">
                <label 
                    :for="String(topic.id)" 
                    class="text-md font-semibold cursor-pointer select-none text-left transition-colors"
                    :class="topic.completed ? 'line-through text-gray-400' : 'text-gray-800'"
                >
                    {{ topic.name }}
                </label>
                <Button @click="$emit('topicId', topic.id)" unstyled class="group flex gap-1 pe-2 hover:text-tertiary flex-nowrap cursor-pointer text-[12px] items-center rounded-xl px-2">
                    questions
                    <span class="pi pi-arrow-right text-xs group-hover:translate-x-1.25 transition-transform duration-300"></span>
                </Button>
                </div>
            </div>

            <div class="flex justify-between gap-4 mt-3 mx-5">
                <button 
                @click="$emit('aiDescription', topic)"
                class="flex items-center gap-1 text-xs font-medium text-sky-700 hover:text-sky-900 cursor-pointer"
                >
                <i class="pi pi-sparkles text-xs"></i> AI description
                </button>
                <button 
                @click="$emit('googleSearch', topic.name)"
                class="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                <i class="pi pi-search text-xs"></i> Google
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import Checkbox from 'primevue/checkbox';
    import Button from 'primevue/button';
    defineProps(['unit', 'isMobile'])
</script>