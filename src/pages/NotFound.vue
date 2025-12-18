<script setup lang="ts">
import { computed, ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import logoBlack from '@/assets/images/logo-black.png'
import logoWhite from '@/assets/images/logo-white.png'

const router = useRouter()
const isDarkMode = ref(document.documentElement.classList.contains('dark'))

const currentLogo = computed(() => isDarkMode.value ? logoWhite : logoBlack)

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center bg-background p-4">
    <div class="mx-auto max-w-md text-center">
      <!-- Logo -->
      <div class="mb-8 flex justify-center">
        <img :src="currentLogo" alt="Olterra Solutions Logo" class="h-24 w-auto object-contain" />
      </div>

      <!-- 404 Text -->
      <h1 class="mb-4 text-9xl font-bold text-primary">404</h1>

      <!-- Message -->
      <h2 class="mb-2 text-2xl font-semibold text-foreground">Page Not Found</h2>
      <p class="mb-8 text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button @click="goBack" variant="outline" class="gap-2">
          <ArrowLeft class="size-4" />
          Go Back
        </Button>
        <Button @click="goHome" class="gap-2">
          <Home class="size-4" />
          Go Home
        </Button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

