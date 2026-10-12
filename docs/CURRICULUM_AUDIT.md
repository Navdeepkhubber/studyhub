# Curriculum source and sequence audit

The complete weekly curriculum schedules all 593 Atlas checkpoints exactly once across 72 study blocks. The 13 Atlas views were reviewed against the learning labels in the PDFs in the user's `Downloads/Roadmap` folder. Several views share checkpoints; a count in one view is not an additional set of work. The Atlas deliberately merges related PDF labels into compound checkpoints. Check a compound item only after completing **every named part** of its label.

`npm run check:data` verifies every checkpoint key, its unique week, a nonempty workload of at most 15 checkpoints per week, all 13 source views, phase ranges, both degree bridge paths, and 28 prerequisite relationships. Each weekly checkbox and its read-only coverage row use the same topic key. Legacy broad task ticks remain in saved backups but do not automatically credit new topic checkpoints.

## Why the order changes

1. Weeks 1–8: Python, R, SQL, Git, shell, data sources and lifecycle. These are prerequisites in the Python, SQL, Data Engineer, R, and AI Agents PDFs.
2. Weeks 9–16: intermediate SQL, linear algebra, probability, NumPy/pandas, and exploratory analysis.
3. Weeks 17–24: inference and experiments, databases, modelling and warehousing, and data cleaning.
4. Weeks 25–32: classical ML and evaluation, Spark foundations, and R visualisation/statistics.
5. Weeks 33–40: deep learning, streaming and lakehouse pipelines, LLM and prompt foundations.
6. Weeks 41–48: NLP, RAG, pipeline quality and operations, and advanced model work.
7. Weeks 49–56: agents and tool use, evaluation, system design, and serving.
8. Weeks 57–64: deployment, AWS essentials, cloud patterns, portfolio and mock interviews.
9. Weeks 65–72: AWS data/serverless topics, final reviews, and portfolio integration.

The source roadmaps are guides, not university course syllabi. The selected statistics or computer science bridge adds twelve explicit tasks across prerequisite-aligned weeks (statistics: weeks 2–29; computer science: weeks 4–30). Existing bridge checkmarks keep their lesson IDs when the calendar week changes. The University of Auckland enrolment guide determines actual course prerequisites and timing; a checked bridge task means preparatory practice, not a completed course. If the offer lists a different combination, Settings can record “Other combination,” but the user must follow their offer rather than either prebuilt bridge.

## PDF coverage review

Each PDF was read as a source of **learning concepts**, including prerequisites, tool names, methods, and advanced branches. The 593 tasks deliberately combine related labels into one checkpoint where the learner must complete every named part. PDF headings, page furniture, advertisements, and links to *other* roadmaps are navigation rather than extra study topics. Where a PDF gives alternatives (for example, AI Engineer prerequisites or a choice of vector store), the weekly task names the alternatives and the learner selects one implementation while understanding the trade-offs.

The source views now include the prerequisite groups named in their PDFs. For example, Data Engineer shows Python, SQL and coding foundations; AI Agents shows backend and Git basics, prompting, RAG, and agent work. Some groups appear in several views because one completed task counts for each related roadmap. The source view is a filtered view of the **same** weekly work, not another checklist.

A checked compound item should mean every part of its label has been practised. For example, learning only Spark transformations does not complete the checkpoint “Lazy evaluation, transformations vs actions, narrow vs wide.” Completion remains self-reported; the app cannot inspect a notebook or repository automatically.

## Source view scheduling

| PDF view | Shared Atlas checkpoints in view | Scheduled weeks |
| --- | ---: | ---: |
| Data Engineer | 180 | 1–64 |
| SQL | 34 | 1–53 |
| Python | 37 | 1–55 |
| Python for Data Analysis | 81 | 1–44 |
| R Programming | 48 | 1–51 |
| System Design | 34 | 50–67 |
| AWS | 23 | 58–71 |
| Machine Learning | 127 | 2–65 |
| AI and Data Scientist | 153 | 1–65 |
| AI Engineer | 115 | 1–64 |
| Prompt Engineering | 36 | 29–42 |
| AI Agents | 109 | 1–64 |
| GeeksforGeeks Data Scientist | 127 | 2–65 |

These counts overlap across sources. The corresponding views are defined in `src/data/roadmaps.ts`, and `npm run check:data` checks that every mapped checkpoint is scheduled exactly once.

## Weekly learning resources

Every scheduled checkpoint shows a **Read** source, a **Practise** source, and a specific **Do** instruction beside its completion checkbox. The weekly plan is the primary study route; roadmap links remain available as background overviews. The resource catalog has 66 group mappings and 32 topic-specific mappings. A topic keeps its resources if its week changes. The selected master's bridge also has reading and practice links in its scheduled week.

`npm run check:data` checks that all 593 checkpoints resolve to complete resources, that resource URLs are HTTPS links, and that each mapped action is substantive. Completing a checkbox remains self-reported: the learner should finish every part of its checkpoint label and save the requested work before checking it.

## Guided study and pacing

The learner’s hour target now determines how many calendar weeks each study block receives. Planning estimates include checkpoint practice, a selected bridge lesson, scheduled portfolio criteria, DSA practice, topic recall, and final evidence. Suggested study sessions depend on available hours. DSA time is budgeted for the daily problem goal on 1–4 scheduled practice days per calendar week; an infeasible goal is flagged rather than silently omitted. A long checkpoint may occupy several sessions; its completion checkbox remains one item. Changing the hour target recalculates dates and sessions while preserving checkpoint IDs and checkmarks.

The 15 portfolio criteria are scheduled as milestones in relevant blocks. The weekly view and Career page use the same `portfolio` keys. DSA’s next problem and due revisions link to the existing tracker; a DSA problem is marked solved only in that tracker. Completed roadmap checkpoints enter a recall queue after three days, with later intervals based on the learner’s self-assessment. Recall does not add new Atlas coverage.

Each block can store a Notion page URL and can generate a note outline. The app does not read or sync Notion content. The final block checkbox counts toward progress only when its checkpoint, selected bridge, and portfolio milestones are complete and the learner records a valid HTTPS evidence link or at least 30 characters of weekly notes. Roadmap coverage still mirrors checkpoint checkmarks directly.

For broad source pages, the weekly view also supplies a search restricted to the reading source’s domain and the exact checkpoint wording. This improves navigation; it is not an independently curated deep link for every checkpoint.

The resource catalog has 67 checkpoint-specific overrides, including direct chapter links for early foundations and multiple readings for composite checkpoints. Other checkpoints retain group sources and a focused source-restricted search. Exact chapters have not yet been hand-curated for all 593 checkpoints.
