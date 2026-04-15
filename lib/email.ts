type SendEmailInput = {
  to: string
  subject: string
  html: string
}

export async function send_email(input: SendEmailInput) {
  console.log('EMAIL_SIMULADO', JSON.stringify(input, null, 2))
  return { success: true }
}
