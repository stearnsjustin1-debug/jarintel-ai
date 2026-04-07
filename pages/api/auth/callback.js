// Handles the redirect from Supabase after a magic link is clicked.
//
// Supabase sends one of two formats depending on flow:
//   • Implicit flow  → #access_token=...  (URL fragment, invisible server-side)
//                      The Supabase JS client on the destination page detects
//                      the fragment via onAuthStateChange automatically.
//   • PKCE / OTP     → ?token_hash=...&type=magiclink
//                      We forward these as query params to the app page,
//                      where verifyOtp() is called client-side.
//
// In both cases we end up on the performance review page and the
// Supabase client handles session establishment.

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

  // Implicit flow: fragment is handled client-side — just land on the page
  res.redirect(303, '/free-tools/performance-review')
}
