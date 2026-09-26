PROMPT FOR ENGINEER: FRONTEND POLISH & PRODUCTION READINESS
Objective
Polish the entire FluxPay frontend (both consumer and merchant flows) to production quality. The flows already work with mock data — now make every screen feel premium, consistent, and production-ready.

This is frontend-only. Use mock data. No backend changes.

Scope
In Scope	Out of Scope
Consumer flow (/sell/*)	Backend logic
Merchant flow (/dashboard/*)	Real API calls
Shared components	New features
Loading/error/empty states	Database changes
Animations & transitions	Provider integrations
Mobile responsiveness	
Accessibility	
Part 1: Loading States (Skeleton Loaders)
Add shimmer skeletons to every data-driven screen. No blank screens.

Screen	Loading State
Consumer Home (Portfolio)	Skeleton for balance + asset rows
Consumer Sell (Token Select)	Skeleton rows while tokens load
Consumer Quote	Skeleton for rate + fee lines
Consumer Payout Accounts	Skeleton for saved accounts list
Consumer Transactions	Skeleton rows for transaction list
Consumer Wallets	Skeleton for balance + address
Merchant Swap	Skeleton for token list + rate
Merchant Settlements Dashboard	Skeleton for summary cards + rows
Merchant Settlement Detail	Skeleton for breakdown table
Merchant Payout Accounts	Skeleton for account cards
Merchant Dashboard Home	Skeleton for stats + recent activity
Skeleton spec:

Background: rgba(139, 92, 246, 0.08)

Shimmer: Light purple sweep from left to right

Duration: 1.5s loop

Border radius: Match the element it replaces

Part 2: Error States
Add error handling to every screen with a clear message and retry action.

Error Type	Display	Action
Network failure	"Connection lost. Check your internet and try again."	Retry button
Quote expired	"Quote expired. Refresh to get a new rate."	Refresh button
Insufficient balance	"You don't have enough [TOKEN]. Reduce the amount or add more."	Edit amount
Account verification failed	"We couldn't verify this account. Check the number and try again."	Retry verification
Transaction failed	"Something went wrong. Your funds are safe. Try again."	Retry transaction
Wallet not connected	"Connect your wallet to continue."	Connect button
Session expired	"Your session expired. Please sign in again."	Redirect to login
Error card spec:

Icon: Warning or error icon (red #ef4444)

Background: rgba(239, 68, 68, 0.1)

Border: rgba(239, 68, 68, 0.3)

Animation: Shake briefly on appear, then settle

Part 3: Empty States
Add empty-state designs for every list or data view.

Screen	Empty State Message	CTA
Consumer Transactions	"No transactions yet. Sell your first crypto."	Go to Sell
Consumer Wallets	"No wallet connected. Connect your Solana wallet."	Connect Wallet
Consumer Assets List	"No assets found. Your Solana tokens will appear here."	Refresh
Merchant Settlements	"No settlements yet. Your history will appear here."	Back to Dashboard
Merchant Payout Accounts	"No payout accounts. Add one to receive fiat."	Add Account
Merchant Payments	"No payments received yet. Share your payment link."	View API Docs
Search results	"No results found for '[query]'."	Clear search
Empty state spec:

Icon: Soft purple illustration (SVG)

Text: Centered, muted gray

CTA: Purple button below

Animation: Fade in with slight upward slide

Part 4: Unified Toast System
Ensure one toast system used across both flows.

Property	Value
Position	Bottom-right
Animation	Slide in from right + fade (250ms)
Auto-dismiss	4 seconds
Stacking	Max 3 toasts, oldest dismisses first
Types	Success (green), Error (red), Info (purple), Warning (amber)
Actions	Optional "View" or "Undo" button
Toast examples:

✅ "Swap complete. ₦15,230 sent to OPay." (success)

⚠️ "Quote expired. Refresh to get a new rate." (warning)

❌ "Transaction failed. Your funds are safe." (error)

ℹ️ "Wallet connected: 7xK...9Pq" (info)

Implementation:

Create src/components/shared/Toast.jsx

Create src/hooks/useToast.js

Replace all existing toast implementations with this one

Part 5: Animation Consistency
Audit every animation. Ensure they follow one system.

Animation	Spec	Duration
Page transition	Fade + slide up	200ms ease-out
Modal open	Scale 0.95 → 1 + fade	150ms
Modal close	Scale 1 → 0.95 + fade	100ms
Button hover	Scale 1.02 + purple glow	150ms
Button click	Scale 0.98	100ms
Number counter	Count up/down	400ms
Step completion	Checkmark SVG draw	300ms
Toast in	Slide from right	250ms
Toast out	Slide to right + fade	200ms
Skeleton shimmer	Left-to-right sweep	1.5s loop
List item stagger	Fade + slide up	50ms apart
Rules:

Every interactive element must have hover + click feedback

No static buttons anywhere

No animation longer than 400ms (except skeletons)

Use Framer Motion consistently

Part 6: Shared Component Audit
Unify duplicated components between consumer and merchant flows.

Component	Current State	Action
Token Selector	May exist in two places	Move to components/shared/
Amount Input	May exist in two places	Move to components/shared/
Fiat Selector	May exist in two places	Move to components/shared/
Quote Display	May exist in two places	Move to components/shared/
Payout Account Form	May exist in two places	Move to components/shared/
Confirm Preview	May exist in two places	Move to components/shared/
Processing Steps	May exist in two places	Move to components/shared/
Success Card	May exist in two places	Move to components/shared/
Transaction Card	May exist in two places	Move to components/shared/
Status Badge	May exist in two places	Move to components/shared/
Rule: If it's used in both flows, it belongs in shared/.

Part 7: Typography & Spacing Consistency
Apply one consistent style guide across every screen.

Element	Spec
H1 (page title)	32px, Inter, bold, tracking-tight
H2 (section)	24px, Inter, semibold
H3 (card title)	18px, Inter, semibold
Body	16px, Inter, regular, leading-relaxed
Small text	14px, Inter, regular
Labels	12px, Inter, uppercase, tracking-wide, #9ca3af
Numbers	Inter, tabular-nums (aligned decimals)
Card padding	24px
Section spacing	32px
Button padding	12px 24px
Border radius (cards)	16px
Border radius (pills)	40px
Border radius (buttons)	12px
Border radius (inputs)	12px
Rule: No custom font sizes. Use only these values.

Part 8: Color Consistency
Ensure no hardcoded colors. Everything uses theme tokens.

Element	Color
Primary	#8b5cf6
Primary hover	#7c3aed
Accent	#c084fc
Background	#0f172a → #1e1b4b (gradient)
Card bg	rgba(30, 31, 38, 0.6)
Border	rgba(139, 92, 246, 0.2)
Success	#10b981
Error	#ef4444
Warning	#f59e0b
Info	#3b82f6
Text primary	#f3f4f6
Text muted	#9ca3af
Action:

Create src/styles/theme.js (or extend Tailwind config)

Replace all hardcoded hex values with theme references

Verify dark mode uses the same tokens (with light-mode overrides)

Part 9: Accessibility
Make every screen accessible.

Check	Requirement
Focus rings	Visible purple outline on all interactive elements
Keyboard nav	Tab + Enter navigates all flows
Screen reader	All icons have aria-label
Buttons	All have descriptive text or ARIA label
Forms	All inputs have associated labels
Contrast	All text meets WCAG AA (4.5:1 minimum)
Reduced motion	Respect prefers-reduced-motion — disable animations
Implementation:

Add focus-visible: classes to all interactive elements

Add aria-label to icon-only buttons

Test with keyboard only (no mouse)

Test with screen reader (NVDA or VoiceOver)

Part 10: Mobile Responsiveness
Test every screen at 375px width (iPhone SE).

Check	Requirement
Layout	No horizontal scroll
Touch targets	All buttons at least 44px tall
Bottom nav	Works on consumer flow
Sidebar	Collapses on merchant flow
Tables	Scroll horizontally, not break
Modals	Full-screen or near-full on mobile
Font sizes	No smaller than 14px
Spacing	Padding scales down gracefully
Action:

Test every screen at 375px, 768px, 1024px, 1440px

Fix any layout breaks

Ensure all touch targets are large enough

Part 11: File Structure
Create these shared files:

text
src/components/shared/
├── Skeleton.jsx              → Shimmer loading placeholder
├── EmptyState.jsx            → Icon + message + CTA
├── ErrorCard.jsx             → Error message + retry button
├── Toast.jsx                 → Unified toast component
├── ToastContainer.jsx        → Toast stack manager
├── StatusBadge.jsx           → Transaction status pill
├── TransactionCard.jsx       → Reusable transaction row
├── PageTransition.jsx        → Wrapper for page animations
├── AnimatedNumber.jsx        → Count-up/count-down number
├── TokenSelector.jsx         → Shared token selector
├── AmountInput.jsx           → Shared amount input
├── FiatSelector.jsx          → Shared fiat selector
├── QuoteDisplay.jsx          → Shared quote display
├── PayoutAccountForm.jsx     → Shared payout form
├── ConfirmPreview.jsx        → Shared confirm view
├── ProcessingSteps.jsx       → Shared processing stepper
└── SuccessCard.jsx           → Shared success card

src/hooks/
├── useToast.js               → Toast hook
├── useMediaQuery.js          → Responsive breakpoints
└── useReducedMotion.js       → Respect reduced motion

src/styles/
├── theme.js                  → Color and spacing tokens
└── animations.js             → Framer Motion variants
Part 12: Acceptance Criteria
□ Every screen has a loading state (skeleton)
□ Every screen has an error state with retry
□ Every list has an empty state
□ One unified toast system across both flows
□ All animations follow the spec (durations, easings)
□ No duplicated components — all shared ones live in shared/
□ Typography follows the style guide
□ Colors use theme tokens, no hardcoded values
□ Focus rings visible on all interactive elements
□ Keyboard navigation works on all screens
□ prefers-reduced-motion respected
□ All screens work at 375px width
□ All touch targets at least 44px
□ Dark mode consistent across all screens
□ Build passes with 0 errors
□ Both flows (/sell/* and /dashboard/*) work end to end
Part 13: What NOT to Do
❌ Do not add new features

❌ Do not build backend logic

❌ Do not change the mock data structure

❌ Do not change the routing

❌ Do not redesign screens — only polish existing ones

❌ Do not touch the merchant or consumer flows' core logic

Final Instruction
Engineer: Polish the entire FluxPay frontend to production quality. Add loading/error/empty states, unify components and toasts, enforce typography and color consistency, ensure accessibility, and verify mobile responsiveness. This is the final frontend pass before backend integration. Use mock data only. No backend calls.

Report back with:

Which screens got loading/error/empty states

Which components were unified into shared/

Confirmation that build passes with 0 errors

Confirmation that both flows work at 375px width

