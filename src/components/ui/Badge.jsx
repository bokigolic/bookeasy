export function Badge({ status }) {
  const map = {
    confirmed: 'badge-confirmed',
    pending: 'badge-pending',
    cancelled: 'badge-cancelled',
  }
  return (
    <span className={map[status] || 'badge-pending'}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
