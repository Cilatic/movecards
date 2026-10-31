<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules
- Built-in exercise/area content stays in src/lib/data/exercises.ts as the fallback; editor overrides (draft/published per key) merge over it via useContent() in src/lib/content.tsx, so screens must read content through useContent, never the static exports, and pages still render instantly before overrides load.
- The /editor previews by loading the real exercise page in an iframe and posting draft content to it; editing rights come only from the admin role row checked by database policies.
- All user data goes through useApp() in src/lib/app-store.tsx, which switches between Cloud tables (profiles, completions) and localStorage for guest mode — never query those tables directly from screens.
- Tab screens wrap in TabScreen (src/components/move/AppGate.tsx) for the sign-in/guest gate and tab bar; exercise pages must not use it (no tab bar there).
- Text size / high contrast are applied as data attributes on <html>; size everything in rem so it scales.
- BackButton uses TanStack's positive history index for in-app back navigation and a typed parent fallback for direct entry; never use browser history length.
- Weekly goal validation/progress is shared in a browser-safe helper, and all goal edits persist through useApp so account and guest screens stay consistent.
- Shared interaction feedback lives in global CSS and applies only to interactive elements, leaving static content and placeholders unchanged.
- Standard exercise steps remain in steps; optional easierSteps resolve through getExerciseSteps for displayed, spoken and large-text instructions so level fallback stays consistent without duplicating content.
- Exercise level state lives on the exercise page and is shared across card sides and large-text view so navigation between views retains the selection.
- Shared PageLoading and router-state NavigationFeedback cover startup and pending navigation without delaying synchronous pages or altering account data loading.
