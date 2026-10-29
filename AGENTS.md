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
- Exercise/area content is static code in src/lib/data/exercises.ts (not DB) so QR-linked pages render without a backend round trip.
- All user data goes through useApp() in src/lib/app-store.tsx, which switches between Cloud tables (profiles, completions) and localStorage for guest mode — never query those tables directly from screens.
- Tab screens wrap in TabScreen (src/components/move/AppGate.tsx) for the sign-in/guest gate and tab bar; exercise pages must not use it (no tab bar there).
- Text size / high contrast are applied as data attributes on <html>; size everything in rem so it scales.
- BackButton uses TanStack's positive history index for in-app back navigation and a typed parent fallback for direct entry; never use browser history length.
- Weekly goal validation/progress is shared in a browser-safe helper, and all goal edits persist through useApp so account and guest screens stay consistent.
- Shared interaction feedback lives in global CSS and applies only to interactive elements, leaving static content and placeholders unchanged.
