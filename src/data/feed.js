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
  {
    id: 'film-festival-opening-night',
    title: 'City Film Festival Opens with Record Attendance and Local Premieres',
    category: 'Entertainment',
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
      'Negotiators worked through multiple all-night sessions to secure a framework aimed at protecting grain and fertilizer flows from sudden disruption. What began as a narrow discussion on emergency stockpiles widened into a broader agreement on monitoring, pricing transparency, and dispute resolution.',
      'The final text introduces a rotating compliance panel drawn from member states and independent experts, charged with investigating reported bottlenecks within days rather than weeks. Its recommendations are non-binding in law but carry significant political weight under the pact\'s dispute procedures.',
      'A new public dashboard will track shipment delays, port dwell times, and declared reasons for hold-ups in near real time. Participating countries committed to publishing standardized manifests and hazard classifications so humanitarian and commercial shippers face fewer contradictory paperwork demands at transit points.',
      'Under the first operational phase, designated ports must implement harmonized digital manifests within 45 days. Smaller facilities will receive technical assistance grants, while larger hubs must open interoperable APIs so third-party logistics platforms can verify status without manual calls.',
      'The pact also caps surcharges applied under declared emergencies, with a review clause triggered if global energy or insurance costs move beyond agreed bands. Shippers welcomed the clarity but warned that enforcement at choke points—where local fees and informal delays persist—will still require sustained attention.',
      'Agricultural associations representing smallholder farmers pressed successfully for language recognizing fair access to fertilizer and seeds, not only grain transit. That language directs development banks to prioritize last-mile storage and cooperative aggregation near production zones.',
      'Humanitarian agencies cautiously welcomed the outcome, noting that previous agreements foundered on weak monitoring. Several directors said predictable corridor access could simplify budgeting for emergency food programs, though they stressed that conflict-related access remains outside the pact\'s scope.',
      'Analysts said the agreement is a meaningful diplomatic signal but not a guarantee against future shocks. Markets moved modestly on the news, with forward contracts on staple grains showing reduced volatility in thin overnight trading.',
      'Summit hosts pledged a follow-up ministerial in ninety days to review dashboard adoption, publish early compliance metrics, and expand membership to countries that observed this round as non-signatories.',
    ],
    author: 'Amina K. Bello',
    date: 'May 16, 2026',
    readTime: '10 min',
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
      'A youth delegation drawn from multiple wards met Dr. Mubarak Musa Saliu this week for a structured dialogue on education, skills training, and local infrastructure priorities. Participants said the tone was constructive and focused on measurable outcomes rather than symbolic gestures.',
      'During the session, youth leaders highlighted completed and ongoing constituency projects—including road repairs, classroom renovations, and modest health outreach—and asked for clearer timelines on several long-promised interventions. Delegates also presented a written memorandum summarizing community expectations.',
      'Organizers emphasized the importance of mentorship pipelines connecting young people with public service, small business, and technical vocational pathways. Several participants noted that internship slots remain competitive and unevenly distributed across wards, a concern Dr. Saliu acknowledged without promising immediate fixes.',
      'The delegation commended visible coordination between community groups and local contractors on a subset of projects, citing fewer abandoned sites compared with previous cycles. They also urged stronger public communication so residents can track approvals, budgets, and contractor performance without relying on informal networks.',
      'Youth representatives pressed for expanded digital literacy programs tied to local enterprise hubs, arguing that connectivity gains elsewhere should not bypass smaller towns. Education officers present at the meeting described pilot partnerships with regional colleges that could scale if funding is secured.',
      'Security and safety briefly entered the discussion after delegates raised concerns about evening transport for students attending supplementary classes. Municipal police representatives outlined existing patrol adjustments and invited youth councils to share hotspot maps confidentially.',
      'Closing remarks framed the engagement as the first in a quarterly series intended to track policy execution and public reporting. Both sides agreed on publication of short readouts after each forum, alongside a consolidated list of action items and responsible offices.',
      'Political observers described the forum as a deliberate attempt to broaden base support ahead of local planning cycles, though civil society analysts welcomed any format that institutionalizes youth access to decision-makers beyond campaign seasons.',
    ],
    author: 'worldgistnews',
    date: 'March 21, 2026',
    readTime: '8 min',
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
      'Two neighboring local government councils in Anambra State are locked in a sharp dispute over which authority should lead the renaming of a major arterial road after distinguished diplomat Chief Emeka Anyaoku. What began as a routine heritage motion has escalated into competing claims of historical ties and administrative jurisdiction.',
      'Officials from both councils have issued separate resolutions endorsing different naming timelines and dedication ceremonies. Each side cites community petitions, elder council letters, and maps they argue support their position, leaving residents confused about which announcements carry legal effect.',
      'The road serves heavy commuter traffic and connects multiple markets; traders say they simply want consistent signage and uninterrupted maintenance funding. Several business associations have asked for a pause on political symbolism until drainage and resurfacing schedules are clarified.',
      'State legal advisers are reportedly reviewing whether road naming in this corridor falls under joint planning mandates or requires a harmonized gazette entry. Until then, contractors have been instructed not to install new plaques without central approval—a move both councils have criticized in public statements.',
      'Traditional leaders from communities along the route called for mediation emphasizing shared history rather than municipal prestige. One palace secretary noted that Anyaoku\'s legacy belongs to the wider region and should not be dragged into zero-sum branding fights.',
      'Civil society groups urged both sides to adopt a transparent public consultation, including documented hearings and published minutes, before any final decision. Activists warned that opaque backroom deals would only invite future litigation and cyclical renaming controversies.',
      'Youth organizations in the area organized a nonpartisan town hall that drew hundreds, with most questions focused on traffic safety and street lighting rather than nomenclature. Panels stressed that infrastructure standards should not fluctuate with council rivalries.',
      'Government sources hinted that the state executive may appoint a neutral commission of historians, planners, and legal officers to recommend a binding pathway. Neither council has publicly endorsed that approach, though business stakeholders described it as the least disruptive option.',
    ],
    author: 'worldgistnews',
    date: 'March 22, 2026',
    readTime: '8 min',
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
      'International monitors announced a significant expansion of field operations along contested coastal stretches where a week-long standoff had restricted humanitarian access and disrupted fishing communities. The deployment follows fragile agreements to pull heavy equipment back from several forward positions.',
      'Two additional verification teams—with mixed civilian-military composition under a unified mandate—will establish temporary observation posts and conduct joint patrol sampling with local liaison officers. Officials stressed that monitors do not have combat authority but may document violations for joint review boards.',
      'Humanitarian agencies that struggled to reach isolated villages welcomed the move, describing stocks of medicine and water-purification supplies as critically low. Relief convoys are planning staggered movements to avoid crowding sensitive corridors during the first seventy-two hours.',
      'Coastal residents interviewed near transit points expressed cautious relief but said intermittent checkpoint disputes still delay market runs and school openings. Fishermen\'s cooperatives asked for neutral marking of safe lanes offshore after several vessels reported harassment signals.',
      'Diplomatic sources cautioned that a durable arrangement still requires agreement on detained personnel, mutual release timelines, and communications protocols between commands that have limited direct contact. Back-channel talks reportedly continued through regional mediators overnight.',
      'A parallel negotiation track is preparing a second verification round focused on heavy weapons storage sites and pre-notification rules for movements above agreed thresholds. Negotiators are debating whether satellite data can supplement on-site counts without triggering security objections.',
      'Neighboring states with economic stakes in port throughput have offered logistical support for monitor rotations, including transit visas and medical evacuation standby. Analysts noted that economic pressure may reinforce restraint more effectively than statements alone in the short term.',
      'The UN Security Council is expected to receive a closed technical briefing next week; major powers have signaled approval for expanded observation as long as mandate language avoids prejudice to long-term political talks that remain stalled on broader governance issues.',
    ],
    author: 'Lena Schreiber',
    date: 'May 15, 2026',
    readTime: '8 min',
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
      'Ruling coalition partners entered what officials describe as the decisive final week of negotiations over the national budget, with health spending floors and municipal revenue transfers dominating closed-door sessions. Ministries have been asked to freeze new discretionary commitments until a consolidated package is Initialled.',
      'Smaller coalition members are demanding legally binding minimum allocations for rural clinics, including dedicated lines for staffing and essential medicines. Finance negotiators counter that rigid floors could complicate mid-year adjustments if revenue underperforms, opening a debate over contingency triggers.',
      'A compromise proposal circulating in the joint technical committee would tie additional health funds to independently audited performance benchmarks—such as vaccination coverage and maternal wait times—rather than flat increases. Regional governors previewed both support and concern, noting uneven administrative capacity to absorb conditional grants.',
      'Urban municipalities pressed for revised formulas they say unfairly weight legacy population estimates over current service demand. Officials from fast-growing cities argued for a time-limited transition that blends old and new indicators to avoid sudden shocks in smaller towns dependent on current shares.',
      'Opposition lawmakers criticized the opacity of side agreements between coalition parties, demanding that any supplementary understandings be tabled for plenary scrutiny. Coalition whips insisted that standard confidence-and-supply language does not require public disclosure of every negotiating note.',
      'Debt service projections and currency assumptions remain sensitive; central bank staff delivered a closed briefing on interest-rate scenarios that could widen the deficit if growth disappoints. Bond market analysts expect volatility around the announcement date regardless of headline totals.',
      'Civil society budget monitors launched a public tracker comparing draft sector ceilings with prior-year execution rates, arguing that appropriated amounts mean little without absorption discipline. Their dashboard highlights persistent underspend in capital maintenance despite rhetorical emphasis on infrastructure.',
      'If the joint committee meets its deadline, leaders could sign a pre-dawn communique and schedule an accelerated parliamentary calendar. Failure to converge would force a short-term continuing resolution—a prospect all sides publicly reject but privately prepare for.',
    ],
    author: 'Tom Brandsen',
    date: 'May 10, 2026',
    readTime: '8 min',
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
      'The national election commission unveiled a new monitoring facility equipped with an analytics dashboard designed to flag anomalous turnout, result entry speeds, and device synchronization patterns in near real time. Officials described the system as assistive—supporting human investigators rather than replacing their judgment.',
      'The platform applies precinct-level historical baselines and compares incoming batch signatures against expected statistical distributions. When thresholds are exceeded, cases are triaged to regional desks with recommended contextual data such as weather disruptions or known equipment swaps.',
      'Commission engineers emphasized redundancy: multiple independent data streams must corroborate an alert before it escalates to national leadership. They also noted hardened audit logs so that later reviews can reconstruct who acknowledged or dismissed each flag.',
      'Opposition observers negotiated read-only access to a sanitized subset of dashboards, a transparency measure praised by civil society though criticized by some parties as insufficient without raw precinct logs. Technical advisers are discussing periodic public exports after results certification.',
      'Privacy advocates raised questions about retention periods for device telemetry and whether anomaly models could inadvertently bias oversight toward densely populated precincts with higher variance. The commission pledged an external review of model fairness after the cycle concludes.',
      'Local officials underwent intensive training simulations mixing synthetic anomalies with benign outliers to calibrate response discipline. Trainers said the goal is to avoid both crying wolf and normalizing suspicious patterns through repeated false negatives.',
      'International observer missions received briefings on escalation protocols and parallel communication lines to embassies in crisis scenarios. Veteran monitors described the setup as more structured than prior cycles, though they cautioned that technology cannot substitute for physical access disputes.',
      'Voter education campaigns will include explainer clips on how transparency tools work, partly to counter rumors alleging invisible manipulation. Commissioners acknowledged that public trust hinges as much on perceived fairness as on statistical precision.',
    ],
    author: 'Diana Ferreira',
    date: 'May 9, 2026',
    readTime: '8 min',
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
      'Verification teams deployed for the election season report a sharp increase in manipulated and synthetic video clips compared with the previous cycle. Short-form platforms amplify marginal edits within minutes, compressing response windows for fact-checkers and party communications desks alike.',
      'Detection software has improved at identifying generative artifacts and inconsistent lighting or lip-sync tells, but capacity bottlenecks remain at the human review layer. Analysts must contextualize clips—distinguishing harmless satire from deliberate voter suppression impersonations.',
      'Major platforms shared aggregated takedown statistics showing median removal times have fallen year-on-year for policy-violating synthetic media labeled as deceptive impersonation. Critics argue opacity around appeals processes still leaves candidates vulnerable to strategic strikes timed for weekends.',
      'Election management bodies convened civil society and broadcaster ethics panels to harmonize on-air debunk formats without amplifying harmful content. Guidelines emphasize slow panes, neutral framing, and links to primary-source transcripts where available.',
      'Law enforcement cyber units traced several viral chains to coordinated inauthentic behavior rings using stolen or repurposed accounts. Prosecutors face evidentiary challenges linking rings to campaign principals without overbroad seizures that chill legitimate speech.',
      'Training academies for journalists now include rapid forensic checklists—metadata inspection, reverse search, and questioning upload chains—though resource-stretched local outlets struggle to apply exhaustive methods on deadline.',
      'Donor-funded consortiums are pooling shared hash libraries of known fakes so partners do not duplicate work. Philosophical debates continue over whether preemptive hashing might suppress authentic leaks that resemble prior forgeries.',
      'Observers expect the final campaign fortnight to be the highest-risk window, when corrections rarely catch up to impressions. Campaigns that invested early in dedicated rapid-response desks report measurably lower dwell times on debunked clips in internal sampling—though public baselines remain disputed.',
    ],
    author: 'Carlos Reyes',
    date: 'May 5, 2026',
    readTime: '8 min',
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
      'Municipal councils in five cities jointly launched a public budget-tracking portal covering roads, schools, and primary health facilities funded through constituency and federal transfer lines. Officials pitched the site as a single window replacing scattered PDF notices and ward-level rumor mills.',
      'Each project page displays approved amounts, contract award dates, responsible departments, and mapped coordinates. Milestone checkboxes—survey, procurement, construction start, inspection—update on a declared schedule, with overdue items highlighted automatically in amber or red.',
      'Contractor names and registration numbers are listed alongside links to prior performance summaries where available. Anti-corruption advocates welcomed the naming rule but urged courts to accelerate appeals on blacklisting disputes so lists remain credible.',
      'Residents can subscribe to SMS or email alerts for specific projects, an accessibility nod to populations without reliable broadband. Librarians in community centers received training to assist older adults navigating the interface.',
      'Independent auditors will sample field progress quarterly and publish variance notes comparing photographic evidence with reported completion percentages. City finance officers said the audits are funded for eighteen months initially, with renewal tied to measurable uptake metrics.',
      'Trade associations representing smaller contractors asked for simplified reporting templates so compliance costs do not exclude qualified bidders. Procurement boards are piloting mobile-first progress photo uploads with checksum verification.',
      'Observers cautioned that trust depends on relentless data hygiene—stale updates could backfire, producing more cynicism than silence. Cities hired dedicated data stewards accountable for timestamp accuracy and dispute-resolution SLAs with ward councilors.',
      'Academic partners will study whether transparency correlates with fewer cost overruns in subsequent phases, using neighboring municipalities as quasi-controls. Early anecdotes suggest competitive attention from media and civic hackers already discouraged exaggerated ribbon-cuttings on unfinished sites.',
    ],
    author: 'Ifeoma Nnaji',
    date: 'April 30, 2026',
    readTime: '8 min',
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
      'A semiconductor startup unveiled a dedicated inference accelerator aimed at on-device diagnostic pipelines—from bedside imaging triage to rapid blood-smear screening—where cloud round trips are unacceptable or connectivity is unreliable.',
      'The chip delivers usable throughput below four watts sustained, allowing integration into portable carts and field clinics without heavy cooling. Architects traded marginal peak benchmarks for deterministic latency envelopes valued in clinical review workflows.',
      'Early design partners include three medical device manufacturers targeting low-resource hospitals and mobile screening units. Pilot programs will stress-test sterilization tolerance, shock resistance, and long idle-power scenarios typical of intermittent grid environments.',
      'Company engineers highlighted privacy advantages: sensitive slices need not leave the room for primary inference, reducing contested data paths. Legal advisers noted hospitals must still navigate consent and audit rules even with local processing.',
      'Competitors question whether software stacks will mature quickly enough for OEMs to justify retooling mid-generation devices. The startup offers reference boards and quantization toolkits, betting on ecosystem speed over proprietary lock-in.',
      'Radiologists involved in sandbox trials reported meaningful draft annotation assistance on chest and extremity studies, while emphasizing that final reads remain physician-led. Nurses noted smoother triage prompts during surge shifts when central PACS queues backlog.',
      'Regulators are watching thermal drift and model versioning: if on-device weights update without traceable approvals, liability chains blur. The firm committed to signed update manifests and rollback slots vetted by hospital IT.',
      'Investors linked the announcement to broader edge-AI enthusiasm, though hospital procurement cycles are notoriously slow. Analysts project revenue inflection only if public insurers codify reimbursement for qualifying AI-assisted screenings.',
      'Ethicists convened an ad hoc panel urging open incident reporting for near-misses involving edge models, arguing voluntary industry silence could delay learning across jurisdictions facing similar deployments.',
    ],
    author: 'Raj Menon',
    date: 'May 8, 2026',
    readTime: '9 min',
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
      'Foreign ministries are quietly expanding use of AI-assisted translation in preparatory briefings and backroom drafting sessions where minutes matter more than literary polish. The tools excel at surfacing aligned terminology across policy papers and reducing repetitive human workload on dense annexes.',
      'Seasoned interpreters emphasize a division of labor: machines churn first-pass equivalents; professionals refine tone, subtext, and culturally freighted idioms before anything enters treaty-track negotiations.',
      'Crisis cells testing multilingual dashboards report faster shared situational awareness when staff monitor live incident feeds auto-rendered into working languages, provided someone validates uncertain fragments immediately.',
      'Researchers warn persistent bias risks for lower-resource languages, where training corpora skew toward news rather than legal or technical registers. Misrendered obligations—even briefly—could fracture trust mid-crisis if not caught.',
      'Security offices scrutinize data residency: which model hosts see draft cables, for how long, and under what contractual deletion rules. Several governments mandated on-prem inference for classification compartments.',
      'Academic linguists note diplomatic speech relies on deliberate ambiguity; systems trained to maximize fluency sometimes collapse nuanced hedging into flat assertions. Human reviewers are drafting style guides mapped to acceptable machine outputs.',
      'Smaller missions without large interpreter benches say adoption is almost economically mandatory for simultaneous small-group talks, while wealthy capitals still staff generously for photo sessions and summits.',
      'Industry vendors compete on latency and offline packs; some bundles now ship embargoed-sector glossaries vetted by subject-matter experts. Still, no vendor assumes liability for consequential mistranslation—fine print ministries must internalize.',
    ],
    author: 'Isabelle Nguyen',
    date: 'May 6, 2026',
    readTime: '8 min',
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
      'Maritime authorities in six countries synchronized activation of a unified customs data exchange designed to let exporters submit manifests once and receive coordinated risk scores before vessels berth. Officials billed the launch as the largest cross-border digital clearance alignment in the region to date.',
      'Early pilot lanes report materially shorter pre-arrival processing windows and fewer manual stamp reconciliations. Consolidators said consolidated billing lowered courier trips between agencies, though some niche commodity codes still require parallel paper proofs pending rule updates.',
      'Engineers spent months harmonizing XML schemas and tolerating legacy mainframe feeds from older terminals via transitional gateways. Night crews ran shadow validations to catch mismatches before public traffic surged.',
      'Trade associations praised directionally lower paperwork costs but demanded transparent incident playbooks for outages—single windows fail cascade if DNS or certificate renewal slips. Operators published maximum recovery time objectives under public oversight.',
      'Customs unions negotiated retraining timelines and incentive pay for overtime during the stabilization quarter. Several chapters raised fears of unchecked automation concentrating discretion in black-box risk engines; management committed to periodic human spot audits.',
      'Smuggling interdiction units gain correlated anomaly views across adjacent jurisdictions, potentially exposing transshipment loopholes faster. Privacy overseers insisted strict role separation so commercial data is not reused for unrelated tax fishing expeditions.',
      'Exporters near land borders asked for equivalent road-rail modules; planners signaled phase two integration contingent on diplomatic ratification of amended annexes.',
      'Econometric teams will publish difference-in-differences estimates twelve months post-launch, comparing dwell times against control ports outside the compact.',
    ],
    author: 'Rina Patel',
    date: 'May 2, 2026',
    readTime: '8 min',
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
      'An education technology coalition finalized a multi-provider agreement to subsidize bandwidth for schools in low-coverage belts, mixing fiber extensions, fixed wireless, and selective satellite backhaul where terrain defeats economical trenching.',
      'The pact pairs raw connectivity with adaptive caching appliances preloaded with open-license textbooks and synchronous lesson shells usable offline between sync windows. Operators waived certain installation fees in exchange for anchor-tenant status in ministry rollouts.',
      'Education officials cautioned that bandwidth alone cannot lift outcomes—parallel investments in teacher training, device lifecycle management, and spare-part logistics determine whether hardware gathers dust. The alliance earmarked a shared helpdesk with SLA tiers for rural districts.',
      'Parents\' associations welcomed the transparency clause publishing uptime dashboards school-by-school, believing sunlight will pressure contractors to fix recurring faults. Some urban districts demanded inclusion despite coverage maps showing surplus capacity.',
      'Regulators scrutinized contract lengths to avoid vendor lock-in preventing competitive rebidding mid-decade. Legal drafts allow early exit if performance benchmarks on jitter and packet loss miss thresholds for two consecutive terms.',
      'Privacy advocates required student telemetry minimization: usage analytics aggregated only at district granularity by default, with stricter consent for individualized traces tied to adaptive tutoring pilots.',
      'Finance ministries still debate co-funding ratios; development banks indicated concessional notes contingent on gender-disaggregated attendance tracking to verify equity gains.',
      'Engineering teams begin site surveys this quarter; unionized line workers secured apprenticeship quotas on tower upgrades associated with the program.',
    ],
    author: 'Mina Al-Karim',
    date: 'April 27, 2026',
    readTime: '8 min',
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
      'A regional education taskforce announced completion of a major expansion installing solar-powered digital classroom hubs across 120 districts previously excluded from reliable broadband maps. Each hub bundles routers, battery storage, rugged student devices, and localized content servers.',
      'Program leads cited fewer instructional interruption days compared with baseline years, attributing gains partly to predictable power and partly to teacher cohort training emphasizing blended modalities rather than ad-hoc streaming.',
      'School administrators reported improved attendance patterns where students previously skipped during exam cram weeks lacking materials; digitized item banks reduced inequality in practice opportunities.',
      'Maintenance cooperatives formed at cluster levels stockpile replacement panels and inverters, avoiding months-long waits for single-site procurement. Financiers structured performance grants on equipment uptime percentages verified remotely.',
      'Guardians interviewed near pilot schools appreciated SMS homework reminders but asked for clearer limits on screen time for younger grades. Psychologists consulted on the rollout recommended mandated offline recreation blocks.',
      'Curriculum offices harmonized open resources with national standards, trimming duplication across provinces. Critics argue pace of content refresh still lags fast-moving current events modules; a volunteer teacher guild now proposes lightweight weekly digests.',
      'Cyber hygiene workshops accompanied hardware distribution after a minor ransomware scare at an early adopter; incident response kits now ship standard.',
      'Longitudinal studies will track standardized scores and dropout rates; baseline matched controls drawn from adjacent offline districts.',
    ],
    author: 'Khadija Omar',
    date: 'May 1, 2026',
    readTime: '8 min',
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
      'Governments and agribusiness cooperatives inaugurated specialized export zones pairing cold-chain infrastructure with digitized traceability from farm lots to container seals. Officials argue the integrated model helps smaller producers meet ever-stricter phytosanitary evidence abroad.',
      'Blockchain-style immutable logs sit alongside low-tech fallback printouts so illiterate smallholders are not excluded; extension officers trained to photograph harvest bags with geotags at aggregation points.',
      'Project managers negotiated refrigerated trucking contracts with penalty clauses for temperature excursions; insurers lowered premiums where zones demonstrate calibrated sensor telemetry.',
      'Economists modeling spillovers anticipate measurable spoilage reductions in high-value horticulture chains, though benefits accrue unevenly if sorting machines concentrate near wealthy valleys.',
      'Environmental groups demanded wastewater plans for washing and packing facilities; permits now require closed-loop filtration pilots.',
      'Trade unions representing logistics staff secured heat-stress mitigation gear and rest cycles during peak season surge hiring.',
      'Importing countries\' inspectors participated in shadow audits to align paperwork expectations before formal equivalence agreements renew next year.',
      'A public dashboard on container freshness scores debuts next month to help buyers benchmark supplier reliability beyond price alone.',
    ],
    author: 'Nora Feldman',
    date: 'April 24, 2026',
    readTime: '8 min',
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
      'The national football league ratified a youth development quota requiring every top-flight club to maintain at least six under-21 players in its senior registered squad and hit minimum accumulated minutes targets spread across competitive fixtures.',
      'Sporting directors debated competitive balance: wealthy academies argued the rule formalizes their investments, while smaller clubs sought extra loan slots and solidarity payments to recruit prospects competitively.',
      'Medical committees appended enhanced monitoring guidelines for adolescent workloads—caps on consecutive match minutes and mandatory recovery metrics reviewed by independent physicians.',
      'Broadcast partners negotiated branding for an "Emerging XI" weekend highlighting youth starts, hoping to lift audience curiosity without gimmick distortions.',
      'Players union representatives secured clauses protecting young professionals from exploitative image rights grabs, mandating guardian or fiduciary review for deals signed before age twenty.',
      'Fan forums split: purists worry tactical quality could dip transiently; reformers celebrate pathways reducing stagnant bench years for touted teenagers.',
      'Youth national team scouts anticipate deeper talent pools but caution coaching quality at reserve level must rise simultaneously or raw minutes become wasted strain.',
      'Compliance audits begin next transfer window; sanctions escalate from fines to registration caps for repeat breaches.',
    ],
    author: 'Daniel Okpara',
    date: 'May 14, 2026',
    readTime: '8 min',
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
      'The football federation kicked off a nationwide stadium compliance program ahead of high-stakes continental qualifiers, commissioning structural engineers and crowd-dynamics consultants to review aging venues.',
      'Priority upgrades span crush barrier reinforcement, widened vomitory exits, LED egress signage synchronized with backup generators, and accessible seating recalculations under revised standards.',
      'Medical triage bays will expand with rehearsed ambulance handoffs; medics participated in full-scale drills simulating concurrent heat exhaustion and minor structural debris scenarios.',
      'Fan liaison councils input on queue management apps and family-zone separation to reduce flashpoint clustering near ultra sections.',
      'Municipal fire departments received interoperable radio patches after past communication gaps during friendlies.',
      'Economically constrained clubs may access phased financing tied to ticket surcharge approvals subject to fan assembly votes.',
      'Heritage façades in two historic grounds won exemptions contingent on interior bypass corridors meeting modern throughput tests.',
      'Certification scores will publish quarterly on an open portal; uncorrected critical faults trigger hosting reassignment clauses.',
    ],
    author: 'Habiba Sule',
    date: 'May 11, 2026',
    readTime: '8 min',
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
      'League clubs and the players union executed a comprehensive welfare charter elevating minimum standards on concussion protocols, travel recovery windows, mental health access, and harassment reporting independence.',
      'Independent neurologists gain veto authority over same-day return-to-play decisions in suspected head injury cases, closing prior loopholes where commercial pressures whispered down-chain.',
      'Mandatory post-long-haul rest periods scale with time zones crossed; schedule compilers must submit algorithms for union review to flag cumulative fatigue spikes.',
      'Confidential counseling benefits expand with telehealth options and privacy firewalls isolating usage data from club HR systems.',
      'Whistleblower channels route outside initial club compliance desks, though clubs retain investigatory cooperation duties under league oversight.',
      'Financial transparency clauses require disclosure of injury insurance pools so players understand coverage ceilings.',
      'Youth academy graduates transitioning to senior deals receive orientation on charter rights within thirty days of signing.',
      'Arbitration panels pre-selected for welfare disputes aim to shorten resolution timelines versus general contract fights.',
    ],
    author: 'Tunde Adebayo',
    date: 'May 7, 2026',
    readTime: '8 min',
    image:
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'film-festival-opening-night',
    category: 'Entertainment',
    title: 'City Film Festival Opens with Record Attendance and Local Premieres',
    summary:
      'Organizers said ticket demand exceeded expectations as independent filmmakers drew major opening-night crowds.',
    body: [
      'The municipal film festival exploded past prior first-day attendance records as walk-up lines snaked around heritage venues unaccustomed to such throughput. Organizers scrambled to release extra standing-room batches for regional premieres.',
      'Programming tilted deliberately toward local and diaspora independence, showcasing more first features than any previous edition curators could recall. Several directors credited micro-grant initiatives seeding post-production finishing funds.',
      'Industry veterans moderated brisk pitching sessions; acquisition scouts from streamers prowled midnight slots hunting word-of-mouth sleepers.',
      'New mentorship corridors paired emerging creators with seasoned producers for six-month structured notes—not theatrical giveaways but surgical feedback on structure and market realism.',
      'City transport authorities extended late tram service after feedback from prior years\' stranded cinephiles; sponsors funded ride-share discount codes.',
      'Accessibility teams provided amplified audio descriptive devices and caption glasses for select screenings, still insufficient for full parity but improved over last cycle.',
      'Pop-up archival booth digitized home-format tapes donors dropped off, crowdsourcing forgotten neighborhood oral histories tangential to on-screen narratives.',
      'Closing metrics will tabulate not only ticket sales but carbon offsets for generator-heavy outdoor installations—a sustainability experiment watchful purists eye skeptically.',
    ],
    author: 'Lara Mensah',
    date: 'May 12, 2026',
    readTime: '8 min',
    image:
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=900&q=80',
    featured: false,
  },
  {
    id: 'music-streaming-local-wave',
    category: 'Entertainment',
    title: 'Streaming Platforms Report Surge in Local Music Discovery',
    summary:
      'New analytics from major platforms show strong growth in regional playlists and emerging artist releases.',
    body: [
      'Major streaming services disclosed internal analytics identifying local-language and hybrid-genre playlists among the fastest-growing engagement categories this quarter, reversing years when global Anglo charts dominated recommendation surfaces.',
      'Label executives credit refined collaborative filtering melded with editorial curation stressing hyper-local editorial shoutouts during commute peaks.',
      'Independent artists report breaking via city-specific vertical video challenges amplified algorithmically when completion rates spike—not without anxiety over opaque demotion later.',
      'Royalty debates intensify: proportionality proposals would weight repeat listens from paid subscribers differently; developing-world coalitions demand forex-transparent payout rails.',
      'Venue talent buyers watch streaming velocity signals to book support slots, compressing discovery-to-stage timelines.',
      'Musicologists archive sonic fusion experiments blending folk percussion with trap hi-hats for scholarly posterity amid commercial velocity.',
      'Platform experiments with fan-funded pre-release tiers split opinion between empowering niche genres and paywalling urgency.',
      'Analysts forecast festival lineups and beverage sponsorship pairings shifting toward regionally resonant headliners through year-end—barring macro ad-spend pullbacks.',
    ],
    author: 'Kevin Ojo',
    date: 'May 4, 2026',
    readTime: '8 min',
    image:
      'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=900&q=80',
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
 * Replace the exports above with async functions calling your real CMS API.
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
