# Multi-Agent 平台 UI 设计提示词（用于 Google Stitch）

## 提示词 1：主聊天界面

```
Design a desktop application main interface for a "Multi-Agent AI Collaboration Platform"
with a tech/sci-fi dark theme aesthetic.

Layout:
- Three-column layout: Left sidebar (280px) | Center chat area (flexible) | Right panel (320px, optional)
- Overall dark theme: bg-slate-950 (#0f172a) with cyan/blue accents
- Font: Inter or SF Pro Display, clean sans-serif

Left Sidebar:
- Header: "Multi-Agent" logo with cyan-400 gradient text
- Search bar with glassmorphism effect (bg-white/5)
- Fixed groups section ("技术方案设计组", "代码审查组") with folder icons
- Expert list with circular avatars (40px), online status indicators (green pulse)
- Selected item highlight: cyan-500/20 background with left border accent
- Bottom user profile section with settings gear icon

Center Chat Area:
- Header: Group name + member count + action buttons (export, settings)
- Message bubbles with distinct styles:
  * User messages: Right-aligned, bg-cyan-600, white text
  * Expert messages: Left-aligned, each expert has unique avatar and color-coded name badge
  * System messages: Center, muted gray, italic
- Parallel expert responses displayed side-by-side in a grid layout when multiple experts reply simultaneously
- Message input area: Fixed bottom, glassmorphism textarea with send button and @mention trigger
- Scrollbar: Thin, dark with cyan thumb

Message Styling:
- Expert avatar: 36px circle with gradient border
- Expert name: Above message, small text with role color (架构师=cyan, 前端=blue, 后端=purple, 安全=orange)
- Code blocks: Syntax highlighted with dark background, rounded corners, copy button
- Conflicting opinions highlighted with red/orange border and "⚠️ Conflict" badge
- @mentions: Highlighted in cyan with glow effect

Right Panel (Optional/Responsive):
- Dashboard mini view: Token usage bar chart, today's task count
- Quick stats: Efficiency metrics in card layout

Tech Aesthetic Details:
- Subtle grid background pattern (opacity 0.02)
- Glow effects: cyan-400/20 blur on hover
- Border gradients: 1px with cyan-500/50
- Animations: Smooth transitions (0.2s), message appear with slight fade-up

Responsive:
- Desktop-first, 1440px viewport
- Right panel collapses at 1200px
- Mobile adaptation with bottom nav (separate design)

Style: Tech, sci-fi, professional, developer-friendly, WeChat-inspired but futuristic
```

---

## 提示词 2：欢迎页 / 模型配置页

```
Design an onboarding/welcome screen for a desktop AI application with tech dark theme.

Layout:
- Centered modal/dialog (700px width) on dark overlay
- Step-by-step wizard interface with progress indicator
- Dark theme: bg-slate-900 with subtle gradient

Header:
- "Welcome to Multi-Agent" large title with cyan gradient
- Subtitle: "Configure your AI providers to get started"
- Progress dots: 4 steps (Provider → API Key → Model → Complete)

Step 1 - Select Provider:
- Grid of provider cards (3 columns):
  * Claude (Anthropic): Purple/indigo gradient card
  * OpenAI GPT: Green/teal gradient card
  * Gemini (Google): Blue gradient card
  * Kimi (Moonshot): Orange gradient card
  * Qwen (阿里): Cyan gradient card
  * GLM (智谱): Red gradient card
  * Custom: Gray card with "+" icon
- Each card: Provider logo, name, "Popular" badge for recommended
- Selected state: Cyan border glow, checkmark icon

Step 2 - API Configuration:
- Selected provider header with icon
- Input fields with floating labels:
  * "Base URL" (pre-filled for known providers)
  * "API Key" (password field with eye toggle, placeholder: "sk-xxxxx")
- "Test Connection" button with loading spinner
- Success/Error message below (green check or red X)
- Security note: "Your API key is encrypted and stored locally"

Step 3 - Select Model:
- List of available models with radio buttons:
  * "claude-sonnet-4-6" - Recommended (blue badge)
  * "claude-opus-4-6" - Most powerful
  * "claude-haiku-4-5" - Fastest
- Model details: Context window size, pricing per 1K tokens
- "Set as default" checkbox

Step 4 - Complete:
- Success illustration (animated checkmark or confetti)
- Summary: "3 providers configured"
- "Start Using" primary button (cyan gradient)
- "Add Another Provider" secondary button

Footer:
- "Skip for now" text link (left)
- Navigation: "Back" | "Next" / "Finish" buttons (right)

Visual Style:
- Glassmorphism cards with subtle borders
- Cyan-400 (#22d3ee) as primary accent
- Smooth transitions between steps
- Subtle background grid pattern
- Professional, trustworthy appearance
```

---

## 提示词 3：Dashboard 数据面板

```
Design a Dashboard view for a desktop AI productivity application with dark tech theme.

Layout:
- Full-width view within main window (replacing chat area)
- Header with title "Dashboard" and date range selector
- Grid layout: 2x2 main cards + 1 full-width chart
- Dark theme: bg-slate-950 with cyan accents

Top Stats Row (4 cards):
1. Efficiency Card:
   - Icon: Clock with speed lines (cyan)
   - Title: "Time Saved"
   - Value: "24.5 hours" large text
   - Subtitle: "+12% vs last week"
   - Trend: Upward arrow green

2. Cost Card:
   - Icon: Coins/dollar sign (yellow)
   - Title: "Cost Efficiency"
   - Value: "ROI 340%"
   - Subtitle: "Spent $15, Saved $51"
   - Mini bar chart: Cost vs Savings

3. Tasks Card:
   - Icon: Checklist (green)
   - Title: "Tasks Completed"
   - Value: "127"
   - Subtitle: "This week"
   - Breakdown: Code review 45 | Design 32 | Docs 50

4. Token Card:
   - Icon: Database (purple)
   - Title: "Token Usage"
   - Value: "2.4M"
   - Subtitle: "12% of monthly limit"
   - Progress bar: Purple gradient fill

Main Chart - Activity Timeline:
- Full width below stats
- Line chart: 7-day activity view
- X-axis: Days (Mon-Sun)
- Y-axis: Tasks / Messages count
- Multiple lines: Total tasks, Code reviews, Design tasks
- Interactive: Hover tooltip with exact values
- Chart style: Smooth curves, gradient fill below lines

Secondary Section - Expert Usage:
- Horizontal bar chart: "Most Used Experts"
- Bars: 架构师 (45%), 代码审查员 (30%), 前端专家 (15%), etc.
- Color-coded by expert type
- Click to filter dashboard

Recent Activity Table:
- Last 10 tasks with details
- Columns: Time | Task | Expert | Duration | Tokens
- Row hover: bg-white/5
- Sortable columns
- Export button (CSV/PDF)

Visual Details:
- Cards: bg-slate-900/50 with border border-slate-800
- Hover: Subtle cyan glow
- Charts: Tremor/Recharts style, dark theme optimized
- Animations: Number count-up on load, smooth chart transitions
- Empty state: "No data yet" with illustration

Data Density: Medium-high, information-rich but not cluttered
Font sizes: Values 32px, Labels 14px, Subtitles 12px
```

---

## 提示词 4：代码审查界面

```
Design a code review interface within a chat-based desktop application.

Layout:
- Split view: Code panel (60%) | Review panel (40%)
- Or: Full-width code message in chat with inline comments
- Dark theme optimized for code readability

Code Panel:
- File header: filename.js, lines count, language badge
- Line numbers: Muted gray, right-aligned, monospace
- Code content: Syntax highlighted (VS Code dark theme colors)
  * Background: bg-slate-900
  * Comments: Green italic
  * Keywords: Purple/blue
  * Strings: Orange
  * Functions: Yellow
- Highlighted lines: Yellow/Red background for issues
- Expandable sections for large files (show 50 lines + "Load more")

Review Comments:
- Inline comments attached to specific lines
- Comment indicator: Red/yellow dot on line number
- On hover: Show comment card with:
  * Expert avatar (small, 24px)
  * Expert name and role
  * Comment text
  * Severity badge: "Critical" | "Warning" | "Suggestion"
- Severity colors: Critical=red-500, Warning=orange-400, Suggestion=blue-400

Review Summary Panel:
- Fixed right panel or collapsible drawer
- Summary stats:
  * Issues found: 12 (3 Critical, 5 Warning, 4 Suggestions)
  * Lines reviewed: 150
  * Estimated fix time: 15 minutes
- Issue list: Scrollable, grouped by severity
  * Collapsible groups
  * Click to jump to line
  * Checkbox to mark as "Fixed"
- Filter: By expert, by severity, by file

Expert Review Tabs:
- Tab per expert: "代码规范" | "性能优化" | "安全检查"
- Active tab: Cyan underline
- Each tab shows expert's specific findings

Action Bar (Bottom):
- "Mark All as Fixed" button
- "Export Report" (Markdown/PDF)
- "Request Re-review" after fixes
- Keyboard shortcuts hint: "Press R to request re-review"

Code Input Methods:
- Paste code directly
- Drag & drop file
- Select from project files (tree view)
- "From Clipboard" quick paste

Empty State:
- "Paste code to start review" with large paste icon
- Supported languages badges: JS, TS, Python, Rust, Go, Java

Accessibility:
- Keyboard navigation (arrow keys, Enter to expand)
- Copy code button on each block
- Line numbers can be toggled
- Font size adjustment

Visual Style:
- Monospace font: JetBrains Mono or Fira Code
- Code font size: 13px, line height 1.5
- Review panel font: Inter, 14px
- Subtle animations for comment appearance
```

---

## 提示词 5：移动端适配（iPhone/Android）

```
Design a mobile adaptation of the Multi-Agent AI platform for iOS/Android.

Device: iPhone 15 Pro (393x852) or Android equivalent
Theme: Dark mode, tech aesthetic with cyan accents

Layout Structure:
- Bottom navigation bar (tab bar) with 4 items:
  * Chat (active): Message icon
  * Experts: Users icon
  * Dashboard: Chart icon
  * Settings: Gear icon
- Safe area handling for notch/dynamic island

Chat List View:
- Header: "Multi-Agent" title, search icon, new chat button
- List of conversations:
  * Avatar group (2-3 expert icons overlapped)
  * Group name: "技术方案设计组"
  * Last message preview: "架构师: 建议用Redis..."
  * Timestamp: "2m"
  * Unread badge: Red circle with count
- Swipe actions: Pin, Archive, Delete
- Pull to refresh

Chat Detail View:
- Header: Back arrow, group name (center), menu (more options)
- Messages: Full-width bubbles, stacked vertically
- Parallel expert responses: Card layout with side-by-side preview
- Tap to expand full response
- Message actions on long press: Copy, Quote, Share

Input Area:
- Fixed bottom with keyboard handling
- Text input with attachment button (left)
- Send button (right, cyan when active)
- @ button for mentioning experts
- Voice input option (microphone icon)

Expert Detail Modal:
- Slide up from bottom
- Expert avatar (large, 80px)
- Name, role, description
- Stats: "Reviewed 45 tasks"
- "Start Chat" primary button
- "Edit" / "Delete" options

Dashboard Mobile:
- Card scroll view (horizontal swipe for stats)
- Simplified charts (sparklines instead of full charts)
- "View Full Report" button to expand
- Activity feed instead of table

Gestures:
- Swipe left: Reply
- Swipe right: Back
- Pull down: Refresh
- Pinch: Zoom code view
- Double tap: Like/React to message

Navigation:
- Tab bar always visible except in chat detail
- Slide transitions between screens
- Modal presentations for settings

Thumb Zone Optimization:
- Primary actions in bottom 1/3
- Back button on left (iOS) or right (Android)
- Floating action button for new chat

Platform Differences:
- iOS: SF Symbols, bottom sheet style, rounded corners
- Android: Material You icons, snackbar notifications, ripple effects

Accessibility:
- Dynamic text sizes
- VoiceOver/TalkBack labels
- High contrast mode support
```

---

## 使用说明

1. 打开 Google Stitch (stitch.withgoogle.com)
2. 创建新项目
3. 复制上述提示词到提示框
4. 根据需要调整细节
5. 生成后可以导出为 Figma 或图片

**提示词技巧**:
- 可以组合使用，如 "Combine prompt 1 and 3"
- 可以要求变体："Generate 3 variations with different color schemes"
- 可以要求交互："Add hover states and click interactions"

**推荐颜色方案**（可在提示词中替换）:
- Primary: Cyan `#22d3ee`
- Background: Slate `#0f172a`
- Surface: `#1e293b`
- Border: `#334155`
- Text Primary: `#f8fafc`
- Text Secondary: `#94a3b8`
```
