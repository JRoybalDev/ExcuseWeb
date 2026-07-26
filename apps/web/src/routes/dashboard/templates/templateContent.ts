export type TemplateBlock = { id: string; heading: string; content: string };

export const templateBlocks: TemplateBlock[] = [
  {
    id: "t_matrix",
    heading: "Packaging matrix (fill before recording)",
    content: `SINGLE STORY CONCEPT (one thing):
PSYCHOLOGICAL HOOK (curiosity gap / stakes / spectacle):
TITLE (40–60 chars, keyword early, sells tension):
THUMBNAIL FOCAL POINT (one subject):
THUMBNAIL TEXT (≤3 words):
MATCH CHECK — title + thumbnail tell ONE message? Y/N:
TOPIC VALIDATED (searched it, demand confirmed)? Y/N:
WATCH-NEXT HANDOFF (which video does this chain into?):`
  },
  {
    id: "t_hook",
    heading: "90-second hook script",
    content: `[0:00–0:05] COLD PROOF — "This is what 40,000 guests running from a Spinosaurus looks like."
[0:05–0:20] STAKES — "One containment breach and this entire park — 30 hours of building — is done."
[0:20–0:45] PLAN — "Today: the new lagoon, a full hybrid roster, and a storm system I did NOT plan for."
[0:45–1:30] FIRST PAYOFF — first reveal / first disaster before minute 2.
After 1:30 — pattern break every 30–60s. Time-lapse everything repetitive. Mid-roll after 4:00 at a scene change.`
  },
  {
    id: "t_desc",
    heading: "Video description skeleton",
    content: `[2-sentence hook that repeats the title's promise and adds one detail]

🎮 Join the Discord — polls decide the next park: [invite link]
🦖 Members get every video early: [membership link]
📺 Streams: Sundays 9am–1pm PT

⏱️ Chapters
0:00 [cold open]
...

🛠️ My setup (affiliate): [links]
📱 TikTok · Instagram: [links]`
  },
  {
    id: "t_short",
    heading: "50-second Short script",
    content: `[0–3s] HOOK — most extreme moment, mid-action, no context: "This dinosaur just deleted my entire park."
[3–35s] ESCALATE — it gets worse. CUT BEFORE THE FIX.
[35–50s] BRIDGE — "Rebuilding this took 12 hours — full video's on the channel. And yes, it gets worse."
Rules: incomplete on purpose · native upload to Shorts + TikTok + Reels · Shorts related-video link · TikTok pinned comment (channel + Discord).`
  },
  {
    id: "t_disc_v",
    heading: "Discord invite — in-video line (say it, don't just link it)",
    content: `"Quick thing — the poll deciding next week's park is up in my Discord right now, and whoever wins gets their build featured. Link's in the description. Anyway, back to this lagoon that's about to flood."`
  },
  {
    id: "t_disc_a",
    heading: "Discord #announcements — upload ping",
    content: `@everyone 🦖 New video is live — [title]

[one line on what goes wrong in it]

Members watched this Wednesday. Next week's park is being voted on in #suggestions-polls right now.
▶️ [link]`
  },
  {
    id: "t_disc_p",
    heading: "Discord — park of the week",
    content: `🏆 PARK OF THE WEEK — @[name]

[screenshot] This layout solved the aviary problem better than mine did, so I'm stealing it for Saturday's video. Post yours in #park-showcase — I pick a new one every week and feature it on stream.`
  },
  {
    id: "t_c1",
    heading: "YouTube Community tab — post 1 of 3 (drive to Discord)",
    content: `🗳️ Which park gets built Saturday? A) All-aviary  B) Carnivores-only island  C) $0 budget challenge — vote here, but the tiebreaker happens live in my Discord: [link]`
  },
  {
    id: "t_c2",
    heading: "YouTube Community tab — post 2 of 3",
    content: `Saturday's park has a problem I've never hit in 200 hours of JWE3. [1 screenshot, no context] Members are watching it early right now. Everyone else: Saturday, 7am. Guesses in the Discord: [link]`
  },
  {
    id: "t_c3",
    heading: "YouTube Community tab — post 3 of 3",
    content: `Posting my full park layouts in the Discord this week — free, no catch, just the save-file screenshots people keep asking for in the comments: [link]`
  },
  {
    id: "t_tip",
    heading: "Stream tipping prompt (say once, mid-stream)",
    content: `"Top Super Chat this hour names the next carnivore — and I have to keep whatever you name it, which last week gave us a T-Rex called Gary."`
  },
  {
    id: "t_mem",
    heading: "Membership mention (10 seconds)",
    content: `"Members are already watching next week's video — link below if you want in early."

$2.99 Park Ranger — early access + badge/emotes + Discord role
$7.99 Park Director — + members series + monthly members stream + private Discord channel`
  },
  {
    id: "t_sp1",
    heading: "Sponsor cold email (Step 1)",
    content: `Subject: JWE3 audience × [Brand] — quick partnership idea

Hi [Name],

I run ExcuseMeImJack, a Jurassic World Evolution 3 channel: [X] subs, [X] avg views, [demo: US/UK, 18–34, PC gamers who buy peripherals and sim games].

[Product] fits because [one specific reason]. I do 60-second integrations woven into the video's story (not pre-roll ad reads) — retention through sponsor segments stays within [X]% of baseline. Rate: $[views/1000 × 20–30] for [expected views] projected views.

Best recent example: [link]. Media kit attached.

Jack`
  },
  {
    id: "t_sp2",
    heading: "Sponsor integration (Step 2 — minute 2–4, after first payoff)",
    content: `"...and rendering this 60,000-guest park at max settings is exactly why my [product] matters — [3 specific benefits SHOWN, not read] — link and code JACK below. Now, back to the storm that's about to ruin everything."

Rules: inside the story · never before the hook lands · one per video · tease what's next before the segment.`
  }
];

export const promptBlocks: TemplateBlock[] = [
  {
    id: "p_ctr",
    heading: "CTR diagnosis",
    content: `Act as a video click-through specialist. My JWE3 videos get [impressions] impressions but only [CTR]% CTR. Here are my last 5 titles and thumbnail descriptions: [paste]. Walk the diagnostic ladder — topic, title, thumbnail, title-thumbnail match, channel page — and tell me which rung is failing and the specific fix.`
  },
  {
    id: "p_title",
    heading: "Title generator",
    content: `Act as a title specialist. Write 5 genuinely different titles for my JWE3 video about [topic], using these formulas: impossible claim, stakes, spectacle number, rule-break, authority ranking. Explain the psychology of each and pick the strongest for a 1K–50K gaming channel.`
  },
  {
    id: "p_match",
    heading: "Title–thumbnail match",
    content: `My title is "[title]" and my thumbnail shows [description]. Act as a packaging consultant: do these tell one message or two? Fix whichever is weaker so the pair feels irresistible rather than confusing.`
  },
  {
    id: "p_topic",
    heading: "Topic validation",
    content: `Act as a topic validation specialist. Is "[video idea]" something JWE3 players actually search for or click from browse? What demand signals should I check, and what's a stronger angle on the same subject if it's weak?`
  },
  {
    id: "p_comp",
    heading: "Competitor comparison",
    content: `These 3 JWE3/park-sim videos outperformed mine on similar subjects: [titles + views]. Mine: [title + views]. Compare the packaging patterns — tension in titles, thumbnail focal points — and tell me which patterns to adopt (not copy).`
  },
  {
    id: "p_ret",
    heading: "Retention fix",
    content: `Here's my retention graph for [video]: [where the dips are]. Act as a retention engineer: diagnose each dip against the 90-second SOP (cold proof / stakes / plan / first payoff) and pattern-break spacing, then rewrite my intro script.`
  },
  {
    id: "p_audit",
    heading: "14-day audit",
    content: `Act as a data-driven channel auditor. Last 14 days: CTR [X]%, avg view duration [X:XX], avg % viewed [X]%, traffic sources [X]% browse / [X]% search / [X]% shorts, subs +[X], revenue $[X], Discord joins [X]. Diagnose the single biggest bottleneck — packaging, retention, topic demand, community funnel, or monetization — and give me this week's one fix.`
  },
  {
    id: "p_disc",
    heading: "Discord growth & engagement",
    content: `Act as a gaming community manager. My JWE3 Discord has [X] members but only [X] are active weekly. Diagnose why it's quiet and give me a 7-day posting plan I can actually sustain solo, plus 3 recurring rituals that make people return without me being online constantly.`
  },
  {
    id: "p_stream",
    heading: "Stream monetization",
    content: `Act as a live-stream strategist. I stream JWE3 Sundays 9am–1pm PT with [X] average concurrent viewers. Design 3 recurring interactive segments that give viewers a genuine reason to Super Chat or sub — without me constantly asking for money — and tell me where in a 4-hour block to place them.`
  },
  {
    id: "p_sp",
    heading: "Sponsor pitch",
    content: `Act as a brand partnership coach. Draft a cold email to [brand] for my JWE3 channel ([subs], [avg views], [demo]) using the Two-Step framework, plus a 60-second integration script woven into a park-build story that protects retention.`
  }
];
