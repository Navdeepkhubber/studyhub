Data Science Study Compass
==========================

A personal study portal for a working data engineer preparing for the
University of Auckland Master of Data Science (240 points, Semester One 2027).

QUICK START
-----------
Serve the folder over HTTP (the service worker and roadmap.json need it):

    python -m http.server 8000
    # then open http://localhost:8000

Opening index.html directly via file:// works for basic use, but the offline
mode and PWA install prompt will not activate.

WHAT'S INSIDE
-------------
- Today view (default landing page) — focus timer, streak, next actions,
  last-7-days activity, quick links
- Overview — the big picture, this week, and three-week preview
- Weekly plan — 24 weeks (20 core + 4 optional). Open any week to see each
  task with its Learn, Read and Practise (or Apply) links, plus skill/goal
  labels in the same card. A final card shows the week's deliverable.
- Practice Hub — SQL, Python, R and DSA with lesson / reading / practice per topic
- Skill map — self-rate each skill and link your evidence; topic skill badges
  jump to the matching skill card
- Career & portfolio — three NZ role paths with portfolio trackers
- Topic atlas — 593 checkpoints across 13 roadmaps (searchable)
- Degree alignment — 240-point requirement map and bridging paths
- Settings & backup — your activity stats, plan preferences, export/import

KEYBOARD
--------
Ctrl+K  (or Cmd+K on Mac)  Open the command palette to search across weeks,
                            topics, skills, resources and pages.
Esc                         Close the palette.

DAILY WORKFLOW
--------------
1. Open Weekly plan and choose your week.
2. Work through each task's Learn, Read and Practise links, then tick Done.
3. Add your deliverable link and notes in Finish the week.
4. Open Today for a timer or to see your next task.

DATA & BACKUP
-------------
Everything (progress, notes, activity, skill ratings, portfolio links) is
stored in your browser's localStorage under 'study-compass-v2'. Export a JSON
backup from Settings before switching devices or clearing browser data.
Restoring replaces current progress.

OFFLINE / PWA
-------------
The service worker keeps an offline copy after the first visit. When online,
page loads check for the latest version. On supported browsers you can install
the app as a standalone app from the address bar or menu.

NOTES
-----
The university course map should be checked against your offer and the 2027
catalogue at study.auckland.ac.nz. DSA trackers and resource links point to
external sites (A2Z Old Sheet, Traverses, VisuAlgo, MIT OpenCourseWare,
GeeksforGeeks, LeetCode and others). The DSA Practice Hub gives each topic
a concept lesson, a written explanation and a direct problem when applicable.
