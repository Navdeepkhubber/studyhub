import roadmapJson from './roadmap.json';
import { curriculum } from './curriculum';
import type { Roadmap } from './types';
const source = roadmapJson as unknown as Roadmap;
const exits = [
  'Run basic Python and R scripts, query relational data, use Git and the shell, and explain the data lifecycle.',
  'Show worked linear algebra and probability examples, exploratory notebooks, and intermediate SQL queries.',
  'Produce an experiment analysis and regression baseline; explain database and warehouse modelling choices.',
  'Compare classical models with held-out evaluation and explain a basic distributed data workflow.',
  'Train a reproducible neural model and build a tested pipeline; explain LLM foundations before RAG.',
  'Evaluate retrieval and a cited RAG answerer; inspect data quality, lineage, and advanced ML results.',
  'Build and test a bounded tool-using agent; document system design trade-offs and evaluation failures.',
  'Deploy a small service, practise AWS essentials, and document projects with tests, cost, and safety notes.',
  'Finish cloud and design depth, complete mock reviews and portfolio artifacts, and record degree bridge gaps.',
];
const capstoneOutputs: Record<number,string> = {
  65: 'Deploy one portfolio service and record its architecture, tests, cost estimate, and recovery steps.',
  66: 'Compare managed cloud data services for your project and complete a timed system design mock.',
  67: 'Publish architecture diagrams for each major project and explain reliability trade-offs.',
  68: 'Run a behavioral mock and revise your resume, LinkedIn, and GitHub from the feedback.',
  69: 'Containerize or package a project, then pin four polished repositories with reproducible instructions.',
  70: 'Build and test a scheduled Lambda task; review weak interview topics and record corrections.',
  71: 'Expose the Lambda task through API Gateway and document security, limits, monitoring, and cost.',
  72: 'Link the finished projects from your resume and perform a final portfolio and degree-bridge review.',
};
export const roadmap: Roadmap = {
  tracks: source.tracks,
  weeks: curriculum.weeks.map(w => ({
    n: w.n,
    f: [...new Set(w.topics.map(key => key[0]))].map(id => [id, `Complete the scheduled ${source.tracks.find(t => t.id === id)!.name.toLowerCase()} checkpoints below.`] as [string,string]),
    o: capstoneOutputs[w.n] ?? `Save worked examples or project evidence for this week's ${w.topics.length} roadmap checkpoints.`,
  })),
  phases: curriculum.phases.map((p,i) => ({ name:p.name, weeks:[p.start,p.end], exit:exits[i] })),
};
