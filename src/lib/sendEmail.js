const FROM = 'BookEasy <noreply@bookeasy.app>'

export async function sendEmail({ to, subject, html, apiKey }) {
  if (!apiKey) return { error: 'No Resend API key configured' }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, to: [to], subject, html }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { error: err.message || 'Failed to send email' }
    }
    return { success: true }
  } catch (e) {
    return { error: e.message }
  }
}

const row = (label, value) =>
  `<tr><td style="color:#6b7280;padding:5px 0;font-size:14px">${label}</td>` +
  `<td style="color:#fff;text-align:right;font-size:14px;font-weight:500">${value}</td></tr>`

const wrap = (title, subtitle, tableRows) => `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:36px 28px;background:#0d0d1f;color:#fff;border-radius:16px;border:1px solid #1a1a3a">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
    <div style="width:32px;height:32px;background:linear-gradient(135deg,#2563ff,#00d4ff);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px">📅</div>
    <span style="font-weight:700;font-size:18px;color:#fff">BookEasy</span>
  </div>
  <h1 style="font-size:22px;margin:0 0 8px;color:#fff">${title}</h1>
  <p style="color:#6b7280;margin:0 0 24px;font-size:15px">${subtitle}</p>
  <div style="background:#05050f;border-radius:10px;padding:16px 20px;margin-bottom:24px">
    <table style="width:100%;border-collapse:collapse">${tableRows}</table>
  </div>
  <p style="color:#4b5680;font-size:12px;margin:0">Powered by <strong style="color:#2563ff">BookEasy</strong></p>
</div>`

export function bookingConfirmationEmail({ clientName, businessName, serviceName, date, time, address }) {
  return {
    subject: `Booking Confirmed — ${serviceName} at ${businessName}`,
    html: wrap(
      'Booking Confirmed ✓',
      `Hi ${clientName}, your appointment is all set!`,
      row('Business', businessName) + row('Service', serviceName) +
      row('Date', date) + row('Time', time) +
      row('Location', address || 'Contact business')
    ),
  }
}

export function bookingReminderEmail({ clientName, businessName, serviceName, date, time }) {
  return {
    subject: `Reminder: ${serviceName} on ${date}`,
    html: wrap(
      'Appointment Reminder 🔔',
      `Hi ${clientName}, just a reminder about your upcoming appointment at ${businessName}.`,
      row('Service', serviceName) + row('Date', date) + row('Time', time)
    ),
  }
}

export function newBookingAlertEmail({ businessOwnerName, clientName, serviceName, date, time, clientEmail }) {
  return {
    subject: `New booking: ${clientName} — ${serviceName}`,
    html: wrap(
      'New Booking 🎉',
      `You have a new appointment request!`,
      row('Client', clientName) + row('Email', clientEmail) +
      row('Service', serviceName) + row('Date', date) + row('Time', time)
    ),
  }
}
