/** AI effort-based replacement-cost estimates for previously unvalued work.
 * Historical estimates in github-cards.js remain untouched.
 */
const replacementCostModel = {
    date: '2026-11-01', rateLow: 3000, rateHigh: 5000,
    sourceTitle: 'Morgan McKinley · Hong Kong Technology Salary Guide 2026',
    sourceUrl: 'https://www.morganmckinley.com/hk/salary-guide/technology/permanent-salaries',
    basis: 'HK$50,000/month full-stack median ÷ 20 professional days, with an assumed 1.2–2.0 delivery-cost multiplier: HK$3,000–5,000/day. Effort and multipliers are AI assumptions. Software replacement cost; excludes operating fees, IP/business valuation and hardware manufacture. Overview and component estimates overlap and must not be added.'
};

const projectEffortEstimates = {
    'hualong-platform': { scope: 'Implemented teacher/parent Mini Program, PC administration and shared-backend integration.', work: [
        ['Requirements & data architecture', 18, 30], ['Three-interface implementation', 55, 95], ['Integration, review workflows & QA', 25, 45]
    ] },
    'teacher-companion': { scope: 'Evidence-led teaching workflow and the current assistant demo, rather than a school-wide production deployment.', work: [
        ['Evidence and curriculum workflow', 8, 14], ['Conversational demo and state', 12, 22], ['Model adapters and verification', 6, 10]
    ] },
    'equalplay': { scope: 'Integrated application-work overview, including shared modules and teacher/service work. Overlaps the component cards; do not sum them.', work: [
        ['Platform architecture and state', 40, 65], ['Learner, teacher and music modules', 100, 165], ['Cross-module integration and QA', 45, 75]
    ] },
    'equalplay-conversion': { scope: 'Implemented conversion/rendering work, including backend-dependent audio/OMR paths. Public audio/OMR sample flows are not counted as independent production services.', work: [
        ['Parsers, notation and fidelity', 20, 35], ['Audio and sheet-processing lanes', 25, 45], ['Review, playback and QA', 15, 25]
    ] },
    'equalplay-practice': { scope: 'Pitch tools, Wait Mode, event replay and evaluation experiments; excludes an unproven accuracy guarantee.', work: [
        ['Capture and note/chord matching', 15, 25], ['Wait Mode and replay', 15, 25], ['Evaluation and integration', 12, 20]
    ] },
    'equalplay-teacher': { scope: 'Implemented teacher console, score editing and integration work, with prototype surfaces kept in scope as prototypes.', work: [
        ['Role-based console workflows', 20, 35], ['Score review and editing', 25, 45], ['Service integration and QA', 20, 35]
    ] },
    'equalplay-games': { scope: 'Implemented Red Light and interval-game work plus design/specification work for the wider game set.', work: [
        ['Game structure and controls', 12, 20], ['Musical mechanics and feedback', 15, 25], ['Exports, integration and playtesting', 8, 15]
    ] },
    'equalplay-engagement': { scope: 'Reward-state integration, virtual-room prototype and token-economy simulation, rather than actual commercial revenue.', work: [
        ['Economy simulation', 10, 18], ['Interactive room and inventory', 10, 18], ['Host integration and checks', 6, 10]
    ] },
    'equalplay-creative': { scope: 'Mock/procedural composition and cover workflows only; excludes model training and a deployed AI generation service.', work: [
        ['Composition and score workflow', 5, 9], ['Cover selection workflow', 4, 7], ['Token flow and QA', 3, 5]
    ] },
    'equalplay-services': { scope: '.NET service/API architecture and implementation work described in the repositories; no unverified production deployment premium.', work: [
        ['API and domain contracts', 20, 35], ['Services and identity integration', 45, 75], ['Cross-service tests and integration', 20, 35]
    ] },
    'equalplay-posture': { scope: 'Specification and engineering-design work only. Excludes hardware fabrication, completed firmware and clinical validation.', work: [
        ['Sensor and device specification', 3, 5], ['App protocol and interface design', 2, 4], ['Design review and documentation', 1, 3]
    ] },
    'attention-to-number': { scope: 'Configurable research-stimulus generation and export, not a participant-testing or clinical-assessment platform.', work: [
        ['Stimulus and parameter design', 3, 5], ['Generation and rendering', 3, 5], ['Export and validation', 2, 4]
    ] },
    'minutes-master': { scope: 'Transcript-to-minutes workspace, contextual dictionaries and provider integration.', work: [
        ['Workspace and setup flow', 8, 14], ['Context and provider integration', 10, 18], ['History, export and QA', 5, 9]
    ] },
    'claude-code-plugins': { scope: 'Session Panel, team orchestration and related developer modifications, including compatibility work.', work: [
        ['Session interface and assumptions', 10, 18], ['Team orchestration', 20, 35], ['Compatibility, documentation and QA', 10, 17]
    ] },
    'citereflex': { scope: 'Current product research, architecture and team/funding preparation only. Excludes the proposed future software build.', work: [
        ['Research and product definition', 4, 7], ['Architecture and scope planning', 3, 5], ['Team and funding preparation', 2, 4]
    ] },
    'eocp': { scope: 'Resource-platform foundation and integration described in the existing case study.', work: [
        ['Platform and content architecture', 15, 25], ['Resource hub implementation', 35, 60], ['Integration, handover and QA', 20, 35]
    ] },
    'imaze': { scope: 'Cognitive-training application and game workflows described in the existing case study; excludes clinical research costs.', work: [
        ['Training workflow and game design', 10, 18], ['Application implementation', 20, 35], ['Playtesting, delivery and QA', 10, 17]
    ] },
    'autosuite': { scope: 'Administrative automation, exception handling and reusable output workflows.', work: [
        ['Workflow mapping', 3, 5], ['Automation scripts and outputs', 7, 12], ['Exception tests and handover', 4, 7]
    ] },

};

function formatCostRange(low, high, currency = false) {
    return `${currency ? 'HKD ' : ''}$${low.toLocaleString('en-HK')} – $${high.toLocaleString('en-HK')}`;
}

Object.entries(projectEffortEstimates).forEach(([id, estimate]) => {
    const items = estimate.work.map(([name, lowDays, highDays]) => ({
        name, lowDays, highDays,
        low: lowDays * replacementCostModel.rateLow,
        high: highDays * replacementCostModel.rateHigh,
        price: formatCostRange(lowDays * replacementCostModel.rateLow, highDays * replacementCostModel.rateHigh),
        desc: `${lowDays}–${highDays} professional days × HK$3,000–5,000/day.`
    }));
    const low = items.reduce((sum, item) => sum + item.low, 0);
    const high = items.reduce((sum, item) => sum + item.high, 0);
    githubCardData[id].valuation = {
        total: formatCostRange(low, high, true), low, high,
        note: 'AI replacement-cost estimate · 1 Nov 2026',
        rationale: estimate.scope,
        items, model: replacementCostModel
    };
});
