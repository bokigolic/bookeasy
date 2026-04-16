/**
 * Generate available time slots.
 * @param {string}   openTime     - "HH:MM"
 * @param {string}   closeTime    - "HH:MM"
 * @param {number}   durationMin  - service duration in minutes
 * @param {string[]} bookedTimes  - already-booked "HH:MM" strings
 * @param {object}   availability - { break_start, break_end, buffer_minutes }
 */
export function generateSlots(openTime, closeTime, durationMin, bookedTimes, availability = {}) {
  const { break_start, break_end, buffer_minutes = 0 } = availability
  const slots = []
  const [oh, om] = openTime.split(':').map(Number)
  const [ch, cm] = closeTime.split(':').map(Number)
  let current = oh * 60 + om
  const end = ch * 60 + cm

  const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m }
  const bsMin = break_start ? toMin(break_start) : -1
  const beMin = break_end   ? toMin(break_end)   : -1

  while (current + durationMin <= end) {
    const h = String(Math.floor(current / 60)).padStart(2, '0')
    const m = String(current % 60).padStart(2, '0')
    const timeStr = `${h}:${m}`

    const inBreak = bsMin >= 0 && beMin > bsMin && current >= bsMin && current < beMin
    const conflict = bookedTimes.some(bt => {
      const btMin = toMin(bt.slice(0, 5))
      // A slot conflicts if it overlaps with a booked slot (including buffer after)
      return current < btMin + durationMin + buffer_minutes && current + durationMin + buffer_minutes > btMin
    })

    if (!inBreak && !conflict) slots.push(timeStr)
    current += durationMin
  }
  return slots
}
