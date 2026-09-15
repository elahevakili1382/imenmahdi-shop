export const PASSWORD_HINT =
  'رمز حداقل ۸ کاراکتر، شامل حرف بزرگ و کوچک انگلیسی، عدد و یک علامت خاص مثل ! @ # $'

export function passwordIssues(password) {
  const value = String(password || '')
  const issues = []
  if (value.length < 8) issues.push('حداقل ۸ کاراکتر')
  if (!/[a-z]/.test(value)) issues.push('یک حرف کوچک انگلیسی')
  if (!/[A-Z]/.test(value)) issues.push('یک حرف بزرگ انگلیسی')
  if (!/\d/.test(value)) issues.push('یک عدد')
  if (!/[^A-Za-z0-9]/.test(value)) issues.push('یک علامت خاص')
  return issues
}

export function isStrongPassword(password) {
  return passwordIssues(password).length === 0
}
