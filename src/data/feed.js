/**
 * News feed data store.
 * In production swap the exported arrays/functions for real API / CMS calls.
 * Example CMS adapter pattern is at the bottom of this file.
 */

export const tickerItems = [
  'Ceasefire Monitors Expand Mission After Coastal Standoff Cools',
  'Breaking: Regional bloc agrees emergency energy corridor safeguards',
  'Politics: Coalition talks continue over municipal health funding',
  'Technology: Port authorities launch unified digital customs window',
  'School: Regional school connectivity initiative reaches 120 districts',
  'Sports: National league adopts new youth development quota for clubs',
]

export const mostRead = [
  {
    id: 'youth-delegation-saliu',
    title: 'Youth Delegation Visits Dr. Mubarak Musa Saliu, Commends His Impact Across the Constituency',
    category: 'Politics',
  },
  {
    id: 'anambra-road-clash',
    title: 'Two Anambra Local Governments Clash Over Renaming of Road After Emeka Anyaoku',
    category: 'Politics',
  },
  {
    id: 'civic-budget-tracker',
    title: 'Cities Open Real-Time Budget Tracker for Constituency Projects',
    category: 'Politics',
  },
  {
    id: 'food-security-pact',
    title: 'Summit Leaders Sign New Food Security Pact After Emergency Talks',
    category: 'World',
  },
  {
    id: 'ai-chip-hospital',
    title: 'AI Chipmaker Debuts Low-Power Edge Processor for Hospitals',
    category: 'Technology',
  },
  {
    id: 'league-youth-quota',
    title: 'National League Adopts Youth Development Quota for All Clubs',
    category: 'Sports',
  },
]

export const articles = [
  {
    id: 'food-security-pact',
    category: 'World',
    title: 'Summit Leaders Sign New Food Security Pact After Emergency Talks',
    summary:
      'After a tense week of negotiations, delegates from 42 nations agreed on a three-point action plan designed to stabilize grain corridors and cap emergency shipping costs.',
    body: [
      'Negotiators worked through the night to secure a framework aimed at protecting grain and fertilizer flows from sudden disruption.',
      'The final text introduces a rotating compliance panel and a public dashboard that tracks shipment delays in near real time.',
      'Under the first phase, participating ports must implement harmonized digital manifests within 45 days.',
    ],
    author: 'Amina K. Bello',
    date: 'May 16, 2026',
    readTime: '8 min',
    image:
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1400&q=80',
    featured: true,
  },
  {
    id: 'youth-delegation-saliu',
    category: 'Politics',
    title: 'Youth Delegation Visits Dr. Mubarak Musa Saliu, Commends His Impact Across the Constituency',
    summary:
      'Community youth leaders praised local development efforts after a consultative visit with Dr. Mubarak Musa Saliu.',
    body: [
      'A youth delegation from multiple wards met with Dr. Mubarak Musa Saliu this week, highlighting infrastructure and education projects in the constituency.',
      'Participants called for stronger civic mentorship programs and expanded internship channels for young people.',
      'Organizers said the forum would become a quarterly engagement platform to track policy execution and public reporting.',
    ],
    author: 'worldgistnews',
    date: 'March 21, 2026',
    readTime: '4 min',
    image:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'anambra-road-clash',
    category: 'Politics',
    title: 'Two Anambra Local Governments Clash Over Renaming of Road After Emeka Anyaoku',
    summary:
      'A naming dispute has triggered inter-council debate over historical recognition and jurisdiction boundaries.',
    body: [
      'Two neighboring local government councils in Anambra State are disputing authority over the renaming of a key arterial road.',
      'Officials from both councils have issued separate resolutions and requested state-level mediation.',
      'Civil society groups urged both sides to adopt a transparent public consultation before finalizing any decision.',
    ],
    author: 'worldgistnews',
    date: 'March 22, 2026',
    readTime: '4 min',
    image:
      'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'ceasefire-monitors',
    category: 'World',
    title: 'Ceasefire Monitors Expand Mission After Coastal Standoff Cools',
    summary:
      'Observers deployed two additional teams as negotiators prepare a second verification round.',
    body: [
      'International monitors announced on Friday a significant expansion of field operations in coastal zones.',
      'The move was welcomed by humanitarian agencies that had struggled to access affected communities.',
      'Diplomatic sources caution that a durable arrangement still requires agreement on detained personnel.',
    ],
    author: 'Lena Schreiber',
    date: 'May 15, 2026',
    readTime: '5 min',
    image:
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'coalition-budget',
    category: 'Politics',
    title: 'Coalition Talks Enter Final Week with Budget Reform at Center',
    summary:
      'Negotiators narrowed disputes around health spending and municipal transfers.',
    body: [
      'Ruling coalition partners entered what officials describe as the final week of budget negotiations.',
      'Smaller coalition members are demanding a spending floor for rural clinics.',
      'A compromise proposal tying additional health funds to performance benchmarks is circulating.',
    ],
    author: 'Tom Brandsen',
    date: 'May 10, 2026',
    readTime: '5 min',
    image:
      'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'election-commission',
    category: 'Politics',
    title: 'Election Commission Deploys New Fraud-Detection Dashboard',
    summary:
      'Officials say the platform flags anomalous turnout patterns in real time.',
    body: [
      'The national election commission opened a monitoring room equipped with a new analytics dashboard.',
      'The system applies historical baselines at precinct level and triggers human review for anomalies.',
      'Opposition observers have been granted read access as a transparency measure.',
    ],
    author: 'Diana Ferreira',
    date: 'May 9, 2026',
    readTime: '4 min',
    image:
      'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'election-clips',
    category: 'Politics',
    title: 'Election Fact-Check Teams Race Against Synthetic Clip Campaigns',
    summary:
      'Disinformation units are scaling up but so are the tools to detect manipulated video.',
    body: [
      'Verification teams say manipulated video circulation has surged compared with the previous election cycle.',
      'Detection software has improved, but human review capacity remains the main bottleneck.',
      'Platform reports show median takedown time has fallen significantly over the last year.',
    ],
    author: 'Carlos Reyes',
    date: 'May 5, 2026',
    readTime: '5 min',
    image:
      'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'civic-budget-tracker',
    category: 'Politics',
    title: 'Cities Open Real-Time Budget Tracker for Constituency Projects',
    summary:
      'A new dashboard lets residents monitor allocations, milestones, and contractor status.',
    body: [
      'Municipal councils in five cities launched a public budget-tracking portal for roads, schools, and health facilities.',
      'The platform includes geotagged project markers and monthly status updates.',
      'Observers say the initiative could strengthen trust if updates remain consistent and complete.',
    ],
    author: 'Ifeoma Nnaji',
    date: 'April 30, 2026',
    readTime: '5 min',
    image:
      'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'ai-chip-hospital',
    category: 'Technology',
    title: 'AI Chipmaker Debuts Low-Power Edge Processor for Hospitals',
    summary:
      'The architecture targets diagnostics systems where low latency is critical.',
    body: [
      'A semiconductor startup unveiled an inference chip for on-device hospital diagnostics.',
      'The chip consumes under four watts, enabling deployment in portable equipment.',
      'Early partners include three device makers targeting low-resource clinical settings.',
    ],
    author: 'Raj Menon',
    date: 'May 8, 2026',
    readTime: '4 min',
    image:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'ai-diplomacy',
    category: 'Technology',
    title: 'How AI Translation Is Changing Diplomacy and Crisis Briefings',
    summary:
      'Real-time multilingual models are reducing interpretation delays in high-stakes settings.',
    body: [
      'Foreign ministries are deploying AI-assisted translation in preparatory briefings where speed matters.',
      'The tools are most useful for working documents, while treaty language still relies on human interpreters.',
      'Researchers caution that model bias across low-resource languages remains a live risk.',
    ],
    author: 'Isabelle Nguyen',
    date: 'May 6, 2026',
    readTime: '5 min',
    image:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'port-digitization-rollout',
    category: 'Technology',
    title: 'Port Authorities Launch Unified Digital Customs Window in 6 Countries',
    summary:
      'A shared platform promises faster clearance and lower paperwork costs for exporters.',
    body: [
      'Maritime authorities across six countries switched on a unified customs data exchange.',
      'Officials say average pre-arrival processing times have dropped in pilot lanes.',
      'Trade associations welcomed the move but requested transparent outage protocols.',
    ],
    author: 'Rina Patel',
    date: 'May 2, 2026',
    readTime: '4 min',
    image:
      'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'edtech-connectivity-pact',
    category: 'Technology',
    title: 'EdTech Alliance Signs Connectivity Pact for Rural Classroom Access',
    summary:
      'Satellite and fiber operators commit subsidized bandwidth for school platforms.',
    body: [
      'An education technology coalition signed a multi-provider connectivity agreement for low-coverage areas.',
      'The initiative combines terrestrial and satellite links with adaptive caching.',
      'Education officials say rollout speed will depend on teacher training and device support.',
    ],
    author: 'Mina Al-Karim',
    date: 'April 27, 2026',
    readTime: '5 min',
    image:
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'school-connectivity-network',
    category: 'School',
    title: 'School Connectivity Network Expands Digital Classrooms to 120 Districts',
    summary:
      'Education agencies report stronger attendance and lesson continuity in underserved communities.',
    body: [
      'A regional education taskforce expanded solar-powered digital classroom hubs to 120 districts.',
      'Program leads said uptime and lesson delivery have improved, with fewer interruption days across participating schools.',
      'School administrators noted more predictable scheduling and improved student attendance in connected campuses.',
    ],
    author: 'Khadija Omar',
    date: 'May 1, 2026',
    readTime: '4 min',
    image:
      'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'agrifood-export-zones',
    category: 'World',
    title: 'New Agri-Food Export Zones Target Traceability and Cold Logistics',
    summary:
      'Trade planners expect fewer spoilage losses and better market access for small producers.',
    body: [
      'Governments and agribusiness cooperatives launched export zones focused on traceability and refrigerated transport links.',
      'Project managers say the model helps smaller producers meet stricter import requirements.',
      'Economists estimate improved handling can reduce loss rates in high-value horticulture chains.',
    ],
    author: 'Nora Feldman',
    date: 'April 24, 2026',
    readTime: '5 min',
    image:
      'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'league-youth-quota',
    category: 'Sports',
    title: 'National League Adopts Youth Development Quota for All Clubs',
    summary:
      'League officials approved a new policy requiring clubs to register and field more under-21 players each season.',
    body: [
      'The national football league voted to introduce a youth development quota aimed at expanding opportunities for academy graduates.',
      'Under the policy, every top-flight club must include at least six under-21 players in its senior squad and ensure minimum match exposure targets over the season.',
      'Club executives said the phased rollout should improve talent retention while balancing competitive performance and long-term player development.',
    ],
    author: 'Daniel Okpara',
    date: 'May 14, 2026',
    readTime: '4 min',
    image:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'stadium-safety-upgrade',
    category: 'Sports',
    title: 'Federation Launches Stadium Safety Upgrade Ahead of Continental Fixtures',
    summary:
      'Inspection teams began phased infrastructure checks and emergency response drills at host venues.',
    body: [
      'Sports authorities have started a nationwide stadium compliance review ahead of major continental qualifying fixtures.',
      'The upgrade package includes crowd-flow redesign, emergency signage modernization, and medical response training for match-day staff.',
      'Officials said certification results will be published in a public dashboard to improve transparency and fan confidence.',
    ],
    author: 'Habiba Sule',
    date: 'May 11, 2026',
    readTime: '5 min',
    image:
      'https://images.unsplash.com/photo-1508098682722-e99c643e7485?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'athlete-welfare-charter',
    category: 'Sports',
    title: 'Players Union and Clubs Sign New Athlete Welfare Charter',
    summary:
      'The charter sets updated standards for injury management, travel recovery, and mental health support.',
    body: [
      'The players union and league clubs have jointly signed a welfare charter that raises baseline standards for athlete care.',
      'Key clauses include independent concussion review protocols, mandatory post-travel recovery windows, and confidential counseling access.',
      'Union leaders called the agreement a practical step toward safer and more sustainable competition calendars.',
    ],
    author: 'Tunde Adebayo',
    date: 'May 7, 2026',
    readTime: '4 min',
    image:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
]

/** All unique category slugs derived from the articles array */
export const categories = [...new Set(articles.map((a) => a.category))].sort()

/** Return all articles for a given category */
export function getByCategory(category) {
  return articles.filter(
    (a) => a.category.toLowerCase() === category.toLowerCase()
  )
}

/** Return a single article by its id slug */
export function getById(id) {
  return articles.find((a) => a.id === id) ?? null
}

/** Return the featured hero article */
export function getFeatured() {
  return articles.find((a) => a.featured) ?? articles[0]
}

/** Return latest N articles (excluding featured hero) */
export function getLatest(n = 6) {
  return articles.filter((a) => !a.featured).slice(0, n)
}

/*
 * ── CMS adapter example ─────────────────────────────────────────────────
 * Replace the exports above with async functions calling your CMS API.
 *
 * Sanity (GROQ):
 *   import { createClient } from '@sanity/client'
 *   const client = createClient({ projectId: 'xxx', dataset: 'production', useCdn: true })
 *   export const getLatest = (n = 6) =>
 *     client.fetch(`*[_type=="article"] | order(publishedAt desc) [0..${n}]`)
 *
 * Contentful:
 *   import contentful from 'contentful'
 *   const client = contentful.createClient({ space: 'xxx', accessToken: process.env.VITE_CF_TOKEN })
 *   export const getLatest = (n = 6) =>
 *     client.getEntries({ content_type: 'article', order: '-sys.createdAt', limit: n })
 *       .then(r => r.items.map(i => i.fields))
 */
