export const CATEGORY_PARENTS = [
  { slug: 'technology', name: 'Technology' },
  { slug: 'finance', name: 'Finance' },
  { slug: 'engineering', name: 'Engineering' },
  { slug: 'healthcare', name: 'Healthcare' },
  { slug: 'construction', name: 'Construction' },
  { slug: 'government', name: 'Government' },
  { slug: 'professional-services', name: 'Professional Services' },
  { slug: 'other-roles', name: 'Other roles' },
] as const;

const CHILD_PARENT: Record<string, (typeof CATEGORY_PARENTS)[number]['slug']> = {
  'software-engineering-it': 'technology',
  cybersecurity: 'technology',
  'data-analytics': 'technology',
  telecommunications: 'technology',
  'product-management': 'technology',
  'cloud-infrastructure': 'technology',
  'quality-assurance-testing': 'technology',
  'erp-sap-crm': 'technology',
  'it-service-management': 'technology',
  'solution-architecture': 'technology',
  'finance-accounting': 'finance',
  'banking-capital-markets': 'finance',
  insurance: 'finance',
  'tax-treasury': 'finance',
  'engineering-manufacturing': 'engineering',
  'automotive-transport': 'engineering',
  'energy-renewables': 'engineering',
  'aerospace-defense': 'engineering',
  'rail-infrastructure': 'engineering',
  utilities: 'engineering',
  'healthcare-medical': 'healthcare',
  'pharmaceuticals-life-sciences': 'healthcare',
  'health-informatics': 'healthcare',
  'construction-property': 'construction',
  'real-estate-proptech': 'construction',
  'quantity-surveying': 'construction',
  'government-public-sector': 'government',
  'marketing-pr-media': 'professional-services',
  'design-creative': 'professional-services',
  'media-entertainment': 'professional-services',
  'sales-business-development': 'professional-services',
  'legal-compliance': 'professional-services',
  'human-resources': 'professional-services',
  'education-edtech': 'professional-services',
  'customer-service-operations': 'professional-services',
  'logistics-supply-chain': 'professional-services',
  'project-programme-management': 'professional-services',
  'business-analysis': 'professional-services',
  'change-transformation': 'professional-services',
  procurement: 'professional-services',
  'retail-ecommerce': 'professional-services',
  'hospitality-tourism': 'professional-services',
  'agriculture-agritech': 'professional-services',
  other: 'other-roles',
};

const SUGGESTIONS: { slug: string; pattern: RegExp }[] = [
  { slug: 'erp-sap-crm', pattern: /\b(sap|abap|workday|netsuite|dynamics 365|salesforce|oracle ebs)\b/i },
  { slug: 'it-service-management', pattern: /\b(servicenow|itil|service desk|\bitsm\b)\b/i },
  { slug: 'solution-architecture', pattern: /\b(solution architect|enterprise architect|technical architect)\b/i },
  { slug: 'cloud-infrastructure', pattern: /\b(cloud engineer|infrastructure engineer|site reliability|\bsre\b|kubernetes|terraform|\bdevops\b)\b/i },
  { slug: 'quality-assurance-testing', pattern: /\b(\bqa\b|quality assurance|test analyst|\btester\b|\bsdet\b)\b/i },
  { slug: 'cybersecurity', pattern: /\b(cyber|infosec|\bsoc\b|siem|penetration|devsecops|security engineer|security analyst)\b/i },
  { slug: 'data-analytics', pattern: /\b(data engineer|data analyst|analytics|power bi|machine learning|data scientist|\bbi\b developer)\b/i },
  { slug: 'telecommunications', pattern: /\b(telecom|\b5g\b|network engineer)\b/i },
  { slug: 'product-management', pattern: /\b(product manager|product owner)\b/i },
  { slug: 'tax-treasury', pattern: /\b(\btax\b|treasury|\bvat\b)\b/i },
  { slug: 'banking-capital-markets', pattern: /\b(investment bank|capital markets|\bkyc\b|\baml\b|equities|private equity)\b/i },
  { slug: 'insurance', pattern: /\b(underwriter|actuar|insurance|claims handler)\b/i },
  { slug: 'finance-accounting', pattern: /\b(accountant|financial|finance|fp&a|audit)\b/i },
  { slug: 'healthcare-medical', pattern: /\b(nurse|clinical|medical|doctor|healthcare|locum)\b/i },
  { slug: 'pharmaceuticals-life-sciences', pattern: /\b(pharma|clinical research|life sciences|biochem)\b/i },
  { slug: 'quantity-surveying', pattern: /\b(quantity survey(?:or)?|\bqs\b|commercial manager)\b/i },
  { slug: 'rail-infrastructure', pattern: /\b(\brail\b|signalling|signaling)\b/i },
  { slug: 'utilities', pattern: /\b(utilities|water industry|nuclear)\b/i },
  { slug: 'health-informatics', pattern: /\b(\bepr\b|epic analyst|health informatics)\b/i },
  { slug: 'construction-property', pattern: /\b(site manager|construction|building surveyor|\brics\b)\b/i },
  { slug: 'engineering-manufacturing', pattern: /\b(mechanical|civil engineer|electrical engineer|structural|manufacturing)\b/i },
  { slug: 'aerospace-defense', pattern: /\b(aerospace|aviation|defence|defense)\b/i },
  { slug: 'energy-renewables', pattern: /\b(renewable|oil and gas|energy trader|grid)\b/i },
  { slug: 'government-public-sector', pattern: /\b(civil service|public sector|local authority|ministry of defence|\bmod\b)\b/i },
  { slug: 'design-creative', pattern: /\b(\bux\b|ui designer|graphic designer|product designer)\b/i },
  { slug: 'legal-compliance', pattern: /\b(solicitor|lawyer|counsel|compliance officer|gdpr)\b/i },
  { slug: 'human-resources', pattern: /\b(\bhr\b|human resources|talent acquisition)\b/i },
  { slug: 'marketing-pr-media', pattern: /\b(marketing|brand manager|\bseo\b|content strategist)\b/i },
  { slug: 'project-programme-management', pattern: /\b(project manager|programme manager|program manager|\bpmo\b|scrum master|delivery manager)\b/i },
  { slug: 'business-analysis', pattern: /\b(business analyst)\b/i },
  { slug: 'change-transformation', pattern: /\b(change manager|transformation lead|organisational change|organizational change)\b/i },
  { slug: 'procurement', pattern: /\b(procurement|\bbuyer\b|purchasing|category manager)\b/i },
  { slug: 'logistics-supply-chain', pattern: /\b(supply chain|logistics|warehouse)\b/i },
  { slug: 'software-engineering-it', pattern: /\b(developer|software|devops|\breact\b|\bpython\b|\bjava\b|\baws\b|full[\s-]?stack|frontend|backend|platform engineer|\.net|cloud)\b/i },
];

export function parentSlugFor(slug: string | null | undefined) {
  if (!slug) return '';
  return CHILD_PARENT[slug] || (CATEGORY_PARENTS.some((parent) => parent.slug === slug) ? slug : '');
}

export function parentNameFor(slug: string | null | undefined) {
  const parent = parentSlugFor(slug);
  return CATEGORY_PARENTS.find((item) => item.slug === parent)?.name || '';
}

export function suggestSubcategorySlug(text: string) {
  const source = text.replace(/<[^>]+>/g, ' ');
  if (/\bsap\b/i.test(source) && /\b(fico|fi\/co)\b/i.test(source)) {
    return 'finance-accounting';
  }
  return SUGGESTIONS.find((rule) => rule.pattern.test(source))?.slug || '';
}
