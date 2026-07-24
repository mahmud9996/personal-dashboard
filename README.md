# Personal Dashboard (private)

Mahmud × Hermes — a personal workspace dashboard. Only the two of us.

## Sections
1. **প্রোডাক্ট রিসার্চ** (`data/products.json`) — ৩টা বেস্ট ক্যান্ডিডেট + ভিজুয়াল অ্যানালেটিক্স (radar + bars)
2. **টেক শেখা** (`data/learning.json`) — নতুন টেকনোলজি ট্র্যাকার
3. **টু-ডু** (`data/todos.json`) — টাস্ক লিস্ট
4. **এজেন্ট লগ** (`data/activity.json`) — Hermes কী করেছে, কীভাবে, কোথায়, কেন ব্যর্থ, কীভাবে ঠিক করেছে

## How it works
- Pure static HTML/CSS/JS — no server, no external libs (charts drawn with inline SVG).
- Open `index.html` in any browser (phone or desktop).
- To update content, edit the JSON in `data/` and commit — the dashboard re-renders automatically.

## Update via agent
Hermes edits the JSON files and pushes. To refresh locally: `git pull`.

## Deploy (optional, free)
Push to GitHub Pages (private repo → Pages from `main` branch, `/root`) or just open the file locally.
