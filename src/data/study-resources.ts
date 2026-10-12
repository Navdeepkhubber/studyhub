import resourcesJson from './study-resources.json';
import type { ScheduledTopic } from '../lib/coverage';

type ResourceLink = [title: string, url: string];
type ResourceRow = [learnId: string, practiceId: string, action: string, extraReadIds?: string[]];
const catalog = resourcesJson as unknown as {
  sources: Record<string, ResourceLink>;
  groups: Record<string, ResourceRow>;
  topics: Record<string, ResourceRow>;
};

/** Resources follow the checkpoint key, so moving a topic to another week keeps its links relevant. */
export function studyResourcesFor(topic: ScheduledTopic) {
  const row = catalog.topics[topic.key] ?? catalog.groups[`${topic.trackId}-${topic.groupIndex}`];
  if (!row) throw new Error(`Missing study resources for ${topic.key}`);
  const [learnId, practiceId, action, extraReadIds = []] = row;
  const learn = catalog.sources[learnId];
  const host = new URL(learn[1]).hostname.replace(/^www\./, '');
  const searchTerms = topic.text.replace(/^(basics|introduction|overview):?\s*/i, '').replace(/[^\p{L}\p{N}]+/gu, ' ').split(/\s+/).filter(word => word.length > 2).slice(0, 8).join(' ');
  const lookup = `https://www.google.com/search?q=${encodeURIComponent(`site:${host} ${searchTerms}`)}`;
  return { learn, extraLearn: extraReadIds.map(id => catalog.sources[id]), practice: catalog.sources[practiceId], action, lookup, targeted: !!catalog.topics[topic.key] };
}
