// Fallback handler for email clients that strip URL fragments.
// Primary magic link flow redirects directly to /free-tools/performance-review
// where detectSessionInUrl:true processes the #access_token fragment client-side.
// This route handles the token_hash/type OTP format as a secondary path.
export default function handler(req, res) {
  const { token_hash, type, error, error_description } = req.query

  if (error) {
    const msg = encodeURIComponent(error_description || error)
    return res.redirect(303, `/free-tools/performance-review?auth_error=${msg}`)
  }

  if (token_hash && type) {
    const params = new URLSearchParams({ token_hash, type })
    return res.redirect(303, `/free-tools/performance-review?${params}`)
  }

  res.redirect(303, '/free-tools/performance-review')
}
