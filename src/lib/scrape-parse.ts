export type LinkedInAuthor = {
  name?: string | null;
  type?: string | null;
  info?: string | null;
  linkedinUrl?: string | null;
  publicIdentifier?: string | null;
  universalName?: string | null;
};

export type LinkedInPost = {
  type?: string;
  id?: string;
  linkedinUrl?: string;
  content?: string;
  author?: LinkedInAuthor;
  article?: { title?: string | null; link?: string | null; subtitle?: string | null };
  job?: { title?: string | null; linkedinUrl?: string | null; location?: string | null; subtitle?: string | null };
  postedAt?: { date?: string | null };
  repost?: LinkedInPost | null;
};

export type LeadClassification = 'publishable' | 'needs_review' | 'reject';
export type RemoteType = 'remote' | 'hybrid' | 'onsite';
export type ClearanceLevel = 'none' | 'BPSS' | 'SC' | 'DV';

export type ParsedLead = {
  sourcePostId: string;
  sourceUrl: string;
  title: string;
  description: string;
  descriptionHtml: string;
  companyName: string;
  recruiterName: string;
  location: string;
  remoteType: RemoteType;
  dayRateMin: number | null;
  dayRateMax: number | null;
  rateNote: string;
  ir35Status: 'outside' | 'inside' | 'undecided';
  clearanceLevel: ClearanceLevel;
  contractLength: string;
  applyUrl: string;
  postedAt: string | null;
  classification: LeadClassification;
  reasons: string[];
  confidence: number;
};

const COMPETITOR_AUTHORS = ['outsideir35', 'outside ir35 jobs', 'jobsrmine'];
const COMPETITOR_HOSTS = ['jobsrmine.com'];
const MARKETING_MARKERS = [
  'you bring the demand',
  'dm “ai partner”',
  'dm "ai partner"',
  'ai engineering capacity on demand',
  'no hiring.',
  'staff augmentation',
];

const UK_PLACES = [
  'london',
  'west london',
  'greater london',
  'city of london',
  'bristol',
  'midlands',
  'manchester',
  'birmingham',
  'leeds',
  'glasgow',
  'edinburgh',
  'cardiff',
  'woking',
  'reading',
  'cambridge',
  'oxford',
  'belfast',
  'uk-wide',
  'united kingdom',
];

const LIST_LINE =
  /^(?:\d+[.)]\s*)?(.+?)\s+[—\-–]+\s+(inside|outside)\s+ir35\s+[—\-–]+\s*(.+)$/i;

export function parseApifyItems(items: unknown[]): ParsedLead[] {
  const posts = items.filter(isPost);
  const leads = posts.flatMap((post) => parseLinkedInPost(post));
  return dedupeLeads(leads);
}

export function parseLinkedInPost(post: LinkedInPost): ParsedLead[] {
  const working = unwrapPost(post);
  const sourceUrl = working.linkedinUrl || post.linkedinUrl || '';
  const postedAt = working.postedAt?.date || post.postedAt?.date || null;
  const text = combinedText(working);
  const author = working.author || post.author || {};
  const rejectReasons = rejectReasonsFor(working, author, text);

  if (rejectReasons.length && !hasExtractableOutsideLines(text)) {
    return [
      leadFromFields({
        sourcePostId: String(post.id || working.id || sourceUrl),
        sourceUrl,
        title: inferTitle(working, text) || author.name || 'LinkedIn post',
        description: text,
        companyName: inferCompany(working, author),
        recruiterName: author.name || '',
        location: inferLocation(working, text),
        remoteType: inferRemote(text),
        ...inferRates(text),
        ir35Status: inferIr35(text),
        clearanceLevel: inferClearance(text),
        contractLength: inferContractLength(text),
        applyUrl: inferApplyUrl(working, text, sourceUrl),
        postedAt,
        classification: 'reject',
        reasons: rejectReasons,
        confidence: 20,
      }),
    ];
  }

  const listLeads = extractListLeads(working, author, text, sourceUrl, postedAt);
  if (listLeads.length > 0) return listLeads;

  const title = inferTitle(working, text);
  const rates = inferRates(text);
  const ir35Status = inferIr35(text);
  const location = inferLocation(working, text);
  const applyUrl = inferApplyUrl(working, text, sourceUrl);
  const reasons: string[] = [];
  if (rejectReasons.length) reasons.push(...rejectReasons);

  const classification = classifySingle({
    title,
    ir35Status,
    hasRate: rates.dayRateMin != null || rates.dayRateMax != null,
    location,
    applyUrl,
    reasons,
  });

  return [
    leadFromFields({
      sourcePostId: String(post.id || working.id || sourceUrl),
      sourceUrl,
      title: title || 'Untitled contract',
      description: text,
      companyName: inferCompany(working, author),
      recruiterName: author.name || '',
      location,
      remoteType: inferRemote(text),
      ...rates,
      ir35Status,
      clearanceLevel: inferClearance(text),
      contractLength: inferContractLength(text),
      applyUrl,
      postedAt,
      classification,
      reasons: reasons.length ? reasons : defaultReasons(classification),
      confidence: confidenceFor(classification, Boolean(title), rates.dayRateMin != null),
    }),
  ];
}

function isPost(item: unknown): item is LinkedInPost {
  if (!item || typeof item !== 'object') return false;
  const value = item as LinkedInPost;
  return Boolean(value.content || value.article || value.job || value.repost);
}

function unwrapPost(post: LinkedInPost): LinkedInPost {
  if (!post.repost) return post;
  const outer = (post.content || '').trim();
  const inner = (post.repost.content || '').trim();
  if (!inner) return post;
  if (!outer || inner.includes(outer) || outer.length < 80) {
    return {
      ...post.repost,
      id: post.id || post.repost.id,
      linkedinUrl: post.linkedinUrl || post.repost.linkedinUrl,
      postedAt: post.postedAt || post.repost.postedAt,
    };
  }
  return {
    ...post,
    content: `${outer}\n\n${inner}`,
  };
}

function combinedText(post: LinkedInPost): string {
  return [post.content, post.article?.title, post.job?.title, post.job?.location]
    .filter(Boolean)
    .join('\n')
    .replace(/\r/g, '')
    .trim();
}

function rejectReasonsFor(post: LinkedInPost, author: LinkedInAuthor, text: string): string[] {
  const reasons: string[] = [];
  const authorBlob = [author.name, author.universalName, author.publicIdentifier, author.info]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  if (COMPETITOR_AUTHORS.some((name) => authorBlob.includes(name))) {
    reasons.push('Competitor or aggregator account');
  }
  const host = hostOf(post.article?.link || post.article?.subtitle || '');
  if (COMPETITOR_HOSTS.includes(host)) {
    reasons.push('Links to a competing job board');
  }
  const lower = text.toLowerCase();
  if (MARKETING_MARKERS.some((marker) => lower.includes(marker))) {
    reasons.push('Partnership or marketing post, not a single role');
  }
  if (isBareHiringLink(text, post)) {
    reasons.push('Too little detail to list as a contract');
  }
  return reasons;
}

function isBareHiringLink(text: string, post: LinkedInPost): boolean {
  const stripped = text.replace(/#\w+/g, '').trim();
  return stripped.length < 40 && Boolean(post.article?.link);
}

function hasExtractableOutsideLines(text: string): boolean {
  return text.split('\n').some((line) => {
    const match = line.trim().match(LIST_LINE);
    return match?.[2]?.toLowerCase() === 'outside';
  });
}

function extractListLeads(
  post: LinkedInPost,
  author: LinkedInAuthor,
  text: string,
  sourceUrl: string,
  postedAt: string | null
): ParsedLead[] {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  const matches = lines
    .map((line) => line.match(LIST_LINE))
    .filter((match): match is RegExpMatchArray => Boolean(match));
  if (matches.length < 2) return [];

  const outside = matches.filter((match) => match[2].toLowerCase() === 'outside');
  if (!outside.length) {
    return [
      leadFromFields({
        sourcePostId: String(post.id || sourceUrl),
        sourceUrl,
        title: inferTitle(post, text) || 'Mixed contract list',
        description: text,
        companyName: inferCompany(post, author),
        recruiterName: author.name || '',
        location: inferLocation(post, text),
        remoteType: inferRemote(text),
        ...inferRates(text),
        ir35Status: 'inside',
        clearanceLevel: inferClearance(text),
        contractLength: inferContractLength(text),
        applyUrl: inferApplyUrl(post, text, sourceUrl),
        postedAt,
        classification: 'reject',
        reasons: ['List contains no Outside IR35 roles'],
        confidence: 70,
      }),
    ];
  }

  return outside.map((match, index) => {
    const title = cleanTitle(match[1]);
    const rest = match[3] || '';
    const rates = inferRates(`${title} ${rest}`);
    const location = inferLocation(post, rest) || inferLocation(post, text);
    const applyUrl = firstUrl(rest) || inferApplyUrl(post, text, sourceUrl);
    return leadFromFields({
      sourcePostId: `${post.id || sourceUrl}:${index + 1}`,
      sourceUrl,
      title,
      description: `${title} — Outside IR35 — ${rest}\n\nSourced from a multi-role recruiter post:\n${text}`,
      companyName: inferCompany(post, author),
      recruiterName: author.name || '',
      location,
      remoteType: inferRemote(rest) !== 'hybrid' ? inferRemote(rest) : inferRemote(text),
      ...rates,
      ir35Status: 'outside',
      clearanceLevel: inferClearance(`${title} ${rest}`),
      contractLength: inferContractLength(rest),
      applyUrl,
      postedAt,
      classification: 'needs_review',
      reasons: ['Split from a mixed or multi-role post — check title, rate, and apply link'],
      confidence: 55,
    });
  });
}

function classifySingle(input: {
  title: string;
  ir35Status: ParsedLead['ir35Status'];
  hasRate: boolean;
  location: string;
  applyUrl: string;
  reasons: string[];
}): LeadClassification {
  if (input.reasons.some((reason) => /competitor|marketing|too little/i.test(reason))) {
    return 'reject';
  }
  if (!input.title) {
    input.reasons.push('Could not extract a job title');
    return input.ir35Status === 'outside' ? 'needs_review' : 'reject';
  }
  if (input.ir35Status === 'inside') {
    input.reasons.push('Inside IR35 only');
    return 'reject';
  }
  if (input.ir35Status !== 'outside') {
    input.reasons.push('IR35 status is not clearly Outside');
    return 'needs_review';
  }
  if (input.hasRate && (input.location || input.applyUrl)) return 'publishable';
  if (input.hasRate) {
    input.reasons.push('Rate found, but location or apply path is thin');
    return 'needs_review';
  }
  input.reasons.push('Outside IR35 role, but rate or details need a human pass');
  return 'needs_review';
}

function inferTitle(post: LinkedInPost, text: string): string {
  const articleTitle = cleanTitle(post.article?.title || '');
  if (articleTitle && !/^https?:/i.test(articleTitle) && articleTitle.length < 120) {
    return stripRateSuffix(articleTitle);
  }
  const jobTitle = cleanTitle(post.job?.title || '');
  if (jobTitle) return jobTitle;

  const looking = text.match(/(?:looking for|speak with) (?:a |an |high level )?([A-Z][^.\n]{6,80}?)(?:\s+to |\s+who |\s+for |\.|$)/);
  if (looking?.[1]) return cleanTitle(looking[1].replace(/ professionals$/i, ''));

  const hiring = text.match(/hiring[:\s]+(?:\d+x\s+)?([A-Za-z][^.\n]{6,80})/i);
  if (hiring?.[1]) return cleanTitle(hiring[1]);

  const lines = text.split('\n').map((line) => line.replace(/[🚨📍📅💷✅⚡✈️📄⏳🔧🎯📩📞]/g, '').trim()).filter(Boolean);
  const first = lines.find((line) => {
    if (!line || line.length > 90) return false;
    if (/^(hi|hello|hey|good |i am |i'm |we |are you|#hiring)/i.test(line)) return false;
    if (/outside ir35 contract|latest job openings/i.test(line)) return false;
    return true;
  }) || '';
  if (first) return stripRateSuffix(cleanTitle(first.replace(/^#hiring\s+/i, '')));

  return '';
}

function inferCompany(post: LinkedInPost, author: LinkedInAuthor): string {
  const byJob = post.job?.subtitle?.replace(/^job by\s+/i, '').trim();
  if (byJob) return byJob;

  const info = author.info || '';
  const atAgency = info.match(/@\s*([A-Za-z0-9][A-Za-z0-9 &.'/-]{1,60}?)(?:\s*[|\-–]|$)/);
  if (atAgency?.[1] && !/also helping/i.test(atAgency[1])) return atAgency[1].trim();

  const atWord = info.match(/\bat\s+([A-Za-z0-9][A-Za-z0-9 &.'/-]{1,60}?)(?:\s*[|\-–,]|$)/i);
  if (atWord?.[1] && !/linkedin/i.test(atWord[1])) return atWord[1].trim();

  if (author.type === 'company' && author.name) return author.name;
  return author.name || 'LinkedIn recruiter';
}

function inferLocation(post: LinkedInPost, text: string): string {
  const jobLoc = (post.job?.location || '').replace(/\s*\(.*\)\s*$/, '').trim();
  if (jobLoc) return jobLoc;

  const lower = text.toLowerCase();
  if (/fully remote|remote · uk|remote,\s*uk|uk-wide|remote welcome/i.test(text) && !/hybrid/i.test(text)) {
    return 'Remote, UK';
  }
  for (const place of UK_PLACES) {
    if (lower.includes(place)) {
      return place.replace(/\b\w/g, (ch) => ch.toUpperCase()).replace('Uk-Wide', 'UK-wide');
    }
  }
  const labelled = text.match(/location:\s*([^\n]+)/i);
  if (labelled?.[1]) return cleanTitle(labelled[1]);
  return '';
}

function inferRemote(text: string): RemoteType {
  const lower = text.toLowerCase();
  if (/fully remote|remote ·|remote welcome|remote,\s*uk/.test(lower) && !/hybrid|onsite|on-site/.test(lower)) {
    return 'remote';
  }
  if (/onsite|on-site|on site/.test(lower) && !/hybrid|remote/.test(lower)) return 'onsite';
  if (/hybrid|wfh|days? (?:in )?(?:the )?office|days typically/.test(lower)) return 'hybrid';
  if (/\bremote\b/.test(lower)) return 'remote';
  return 'hybrid';
}

function inferRates(text: string): { dayRateMin: number | null; dayRateMax: number | null; rateNote: string } {
  const dayRange = text.match(/£\s?(\d{2,4})\s*(?:[-–—]|to)\s*£?\s?(\d{2,4})\s*(?:pd|p\/d|per\s*day|\/day)/i);
  if (dayRange) {
    return {
      dayRateMin: Number(dayRange[1]),
      dayRateMax: Number(dayRange[2]),
      rateNote: `£${dayRange[1]}–£${dayRange[2]} per day`,
    };
  }
  const upToDay = text.match(/up to £\s?(\d{2,4})\s*(?:pd|p\/d|per\s*day|\/day)/i);
  if (upToDay) {
    return { dayRateMin: Number(upToDay[1]), dayRateMax: Number(upToDay[1]), rateNote: `Up to £${upToDay[1]} per day` };
  }
  const singleDay = text.match(/£\s?(\d{2,4})\s*(?:pd|p\/d|per\s*day|\/day)/i);
  if (singleDay) {
    return { dayRateMin: Number(singleDay[1]), dayRateMax: Number(singleDay[1]), rateNote: `£${singleDay[1]} per day` };
  }

  const hourRange = text.match(/£\s?(\d{2,3})\s*(?:[-–—]|to)\s*£?\s?(\d{2,3})\s*(?:p\/h|ph|per\s*hour|p\/hr|\/h)/i);
  if (hourRange) {
    const min = Number(hourRange[1]) * 8;
    const max = Number(hourRange[2]) * 8;
    return {
      dayRateMin: min,
      dayRateMax: max,
      rateNote: `Posted as £${hourRange[1]}–£${hourRange[2]}/hour (shown as £${min}–£${max}/day)`,
    };
  }
  const singleHour = text.match(/£\s?(\d{2,3})\s*(?:p\/h|ph|per\s*hour|p\/hr|\/h)/i);
  if (singleHour) {
    const day = Number(singleHour[1]) * 8;
    return {
      dayRateMin: day,
      dayRateMax: day,
      rateNote: `Posted as £${singleHour[1]}/hour (shown as £${day}/day)`,
    };
  }
  return { dayRateMin: null, dayRateMax: null, rateNote: '' };
}

function inferIr35(text: string): ParsedLead['ir35Status'] {
  const lower = text.toLowerCase();
  const outside = (lower.match(/outside\s+ir35/g) || []).length;
  const inside = (lower.match(/inside\s+ir35/g) || []).length;
  if (outside && !inside) return 'outside';
  if (inside && !outside) return 'inside';
  if (outside && inside) return 'undecided';
  return 'undecided';
}

function inferClearance(text: string): ClearanceLevel {
  const upper = text.toUpperCase();
  if (/\bDV\b/.test(upper)) return 'DV';
  if (/\bSC\b/.test(upper) || /SC CLEARANCE/.test(upper)) return 'SC';
  if (/\bBPSS\b/.test(upper)) return 'BPSS';
  return 'none';
}

function inferContractLength(text: string): string {
  const match = text.match(/(\d+\+?\s*(?:week|month|day)s?(?:\s+initially)?|\d+-week(?:\s+engagement)?)/i);
  return match?.[1]?.replace(/\s+/g, ' ').trim() || '';
}

function inferApplyUrl(post: LinkedInPost, text: string, fallback: string): string {
  if (post.article?.link && !COMPETITOR_HOSTS.includes(hostOf(post.article.link))) {
    return post.article.link;
  }
  if (post.job?.linkedinUrl) return post.job.linkedinUrl;
  const url = firstUrl(text);
  if (url && !/linkedin\.com\/(posts|feed|in)\//i.test(url)) return url;
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (email) return `mailto:${email[0].toLowerCase()}`;
  return fallback;
}

function firstUrl(text: string): string {
  const match = text.match(/https?:\/\/[^\s)]+/i);
  return match?.[0]?.replace(/[.,;]+$/, '') || '';
}

function hostOf(value: string): string {
  try {
    if (value.includes('.') && !value.includes('://')) return value.toLowerCase();
    return new URL(value).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return value.toLowerCase();
  }
}

function cleanTitle(value: string): string {
  return value
    .replace(/[🚨📍📅💷✅⚡✈️📄⏳🔧🎯📩📞#*]/g, '')
    .replace(/\s+[—\-–|].*$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripRateSuffix(value: string): string {
  return value.replace(/\s*[·,|-]\s*£.+$/, '').replace(/\s*outside ir35.*$/i, '').trim();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function toJobHtml(text: string, rateNote?: string): string {
  const blocks = escapeHtml(text)
    .split(/\n{2,}/)
    .map((block) => `<p>${block.replace(/\n/g, '<br/>')}</p>`)
    .join('');
  const note = rateNote ? `<p><em>${escapeHtml(rateNote)}</em></p>` : '';
  return `${note}${blocks}`;
}

function defaultReasons(classification: LeadClassification): string[] {
  if (classification === 'publishable') return ['Clear single Outside IR35 role'];
  if (classification === 'needs_review') return ['Needs a human check before going live'];
  return ['Not a listable Outside IR35 role'];
}

function confidenceFor(classification: LeadClassification, hasTitle: boolean, hasRate: boolean): number {
  if (classification === 'publishable') return hasRate ? 88 : 75;
  if (classification === 'needs_review') return hasTitle ? 58 : 40;
  return 25;
}

function leadFromFields(input: Omit<ParsedLead, 'descriptionHtml'>): ParsedLead {
  return {
    ...input,
    location: input.location || (input.remoteType === 'remote' ? 'Remote, UK' : 'United Kingdom'),
    descriptionHtml: toJobHtml(input.description, input.rateNote),
  };
}

function fingerprint(lead: ParsedLead): string {
  return [lead.title, lead.companyName, lead.dayRateMin, lead.dayRateMax]
    .map((value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ''))
    .join('|');
}

function dedupeLeads(leads: ParsedLead[]): ParsedLead[] {
  const seen = new Set<string>();
  return leads.filter((lead) => {
    const key = fingerprint(lead);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
