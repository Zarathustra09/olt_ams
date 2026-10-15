import { computed, onMounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { TransitionPresets, usePreferredReducedMotion, useTransition } from '@vueuse/core'

type Easing = keyof typeof TransitionPresets

/**
 * Tweens towards `source`. Starts at 0 and sweeps up once mounted.
 * Snaps instead of tweening when the OS requests reduced motion.
 */
export function useAnimatedNumber(source: MaybeRefOrGetter<number>, duration = 900, easing: Easing = 'easeOutCubic') {
  const reduced = usePreferredReducedMotion()
  const target = ref(0)

  const animated = useTransition(target, {
    duration: computed(() => (reduced.value === 'reduce' ? 0 : duration)),
    transition: TransitionPresets[easing],
  })

  onMounted(() => {
    target.value = toValue(source)
  })
  watch(() => toValue(source), (v) => {
    target.value = v
  })

  return animated
}
