import { ref } from 'vue'

// True once the first-load skeleton has been shown. Module-level so it only happens once per visit.
const ready = ref(false)
let started = false

export function useFirstLoad(delayMs = 700) {
  if (!started) {
    started = true
    setTimeout(() => (ready.value = true), delayMs)
  }
  return ready
}
