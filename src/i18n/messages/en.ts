import type zhCN from "./zh-CN";
const messages: Record<keyof typeof zhCN, string> = {
  "search.placeholder": "Search creations, creators, or tags...", "action.publish": "Publish",
  "hero.title.line1": "Creativity without limits", "hero.title.line2": "Let ideas", "hero.title.accent": "shine with AI",
  "hero.subtitle": "Discover, share, and create endless possibilities on Picoo", "hero.explore": "Explore", "hero.publish": "Publish",
  "section.featured": "Featured", "section.trending": "Trending now", "tab.recommended": "For you", "tab.latest": "Latest",
  "tab.popular": "Popular", "tab.following": "Following", "action.viewAll": "View all", "syndication.title": "From the web",
  "syndication.summary": "RSS updates from 28 selected AI creator sites", "syndication.manage": "Subscriptions",
  "syndication.channels": "Channels", "locale.switch": "中文",
  "auth.signIn.title": "Welcome back", "auth.signIn.subtitle": "Keep exploring and creating remarkable AI work",
  "auth.signUp.title": "Create your Picoo account", "auth.signUp.subtitle": "Join AI creators to collect, remix, and publish",
  "auth.name": "Display name", "auth.handle": "Handle", "auth.email": "Email", "auth.password": "Password",
  "auth.passwordHint": "At least 10 characters with upper, lower case letters and a number",
  "auth.signIn.action": "Sign in", "auth.signUp.action": "Create account", "auth.signIn.pending": "Signing in...",
  "auth.signUp.pending": "Creating account...", "auth.noAccount": "New to Picoo?", "auth.hasAccount": "Already registered?",
  "auth.signUp.link": "Create an account", "auth.signIn.link": "Back to sign in",
  "auth.error.credentials": "Incorrect email or password", "auth.error.register": "Registration failed. Check your details and retry",
  "explore.title": "Explore", "explore.empty": "No published creations yet. Be the first to publish.",
  "explore.sort.latest": "Latest", "explore.sort.trending": "Trending",
  "creation.remixFrom": "Remixed from", "creation.compatibleModels": "Compatible models",
  "creator.works": "Works", "creator.verified": "Verified creator", "creator.empty": "This creator has no public works yet.",
};
export default messages;
