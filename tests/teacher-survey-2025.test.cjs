const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const pm = fs.readFileSync(path.join(__dirname, '..', 'project-management.html'), 'utf8');
const edu = fs.readFileSync(path.join(__dirname, '..', 'education-culture.html'), 'utf8');
const decode = s => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"');
const attrs = s => Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], decode(m[2])]));
function records(html, kind) {
    return [...html.matchAll(/<li\b([^>]*data-source-kind="([^"]+)"[^>]*)>([\s\S]*?)<\/li>/g)]
        .filter(m => m[2] === kind).map(m => ({ attrs: attrs(m[1]), body: m[3], links: [...m[3].matchAll(/href="([^"]+)"/g)].map(a => decode(a[1])) }));
}
const publications = records(pm, 'publication-2025');
const record = id => publications.find(r => r.attrs.id === 'publication-2025-' + id);

test('2025 publication accounting retains 19 items, 15 brands and 12 conservative clusters', () => {
    assert.equal(publications.length, 19);
    const urls = publications.map(r => r.links[0] || decode(r.body.match(/Historical URL: ([^<]+)/)[1]));
    assert.equal(new Set(urls.map(u => new URL(u).href)).size, 19);
    assert.equal(publications.filter(r => r.attrs['data-item-type'] === 'article').length, 16);
    assert.equal(publications.filter(r => r.attrs['data-item-type'] === 'broadcast').length, 3);
    assert.equal(new Set(publications.map(r => r.attrs['data-editorial-brand'])).size, 15);
    assert.deepEqual([...new Set(publications.map(r => r.attrs['data-editorial-cluster']))].sort(), [
        'HK01', 'HKET/CTgoodjobs', 'SCMP', 'Sing Tao', 'TKWW family', 'JDOnline', 'CRNTT', 'Ming Pao', 'TVB', 'am730', 'RTHK', 'Now'
    ].sort());
    assert.equal(publications.filter(r => r.attrs['data-evidence-basis'] === 'publisher').length, 17);
    assert.deepEqual(publications.filter(r => r.attrs['data-evidence-basis'] === 'clipping').map(r => r.attrs.id), ['publication-2025-12', 'publication-2025-13']);
});

test('all seven existing badge brands lead to the matching 2025 campaign evidence', () => {
    const row = pm.match(/<div class="press-row[^>]*>([\s\S]*?)<\/div>/)[0];
    const badges = [...row.matchAll(/<a\b([^>]*)>([^<]+)<\/a>/g)].map(m => ({ ...attrs(m[1]), text: m[2] }));
    assert.equal(badges.length, 7);
    assert(!row.includes('aria-hidden="true"'));
    const expected = { HK01: '01', CTJobs: '03', SCMP: '04', DotDotNews: '07', SingTao: '05', JDOnline: '08' };
    for (const [label, id] of Object.entries(expected)) assert.equal(badges.find(b => b.text === label).href, record(id).links[0]);
    assert.equal(badges.find(b => b.text === 'CTJobs')['aria-label'], 'CTgoodjobs');
    const rthk = badges.find(b => b.text === 'RTHK');
    assert.equal(rthk.href, '#publication-2025-17');
    assert.match(rthk['aria-label'], /historical.*unavailable/);
});

test('NOW is one completed appearance, distinct from the unavailable historical RTHK record', () => {
    const now = publications.filter(r => r.attrs['data-broadcast-status'] === 'archived-completed');
    assert.equal(now.length, 2);
    assert.equal(new Set(now.map(r => r.attrs['data-appearance-id'])).size, 1);
    assert.deepEqual(now.map(r => r.links[0]), ['https://news.now.com/home/local/player?newsId=618287', 'https://news.now.com/home/local/player?newsId=618288']);
    assert(now.every(r => r.body.includes('Eva Lau and Tang Fei')));
    const rthk = record('17');
    assert.equal(rthk.attrs['data-broadcast-status'], 'historical');
    assert.equal(rthk.attrs['data-access'], 'unavailable');
    assert.equal(rthk.links.length, 0);
    assert(rthk.body.includes('Historical interview archive; current link unavailable'));
    assert(record('18').body.includes('Online publication time is not the planned live slot'));
});

test('2025 social captions stay separate with four owned, six external/unverified and one disputed date', () => {
    const social = records(edu, 'social-2025');
    assert.equal(social.length, 10);
    assert.equal(new Set(social.flatMap(r => r.links)).size, 10);
    assert.equal(social.filter(r => r.attrs['data-ownership'] === 'university').length, 4);
    assert.equal(social.filter(r => r.attrs['data-ownership'] === 'external-or-unverified').length, 6);
    assert.equal(social.filter(r => r.attrs['data-date-status'] === 'source-calendar').length, 9);
    const disputed = social.filter(r => r.attrs['data-date-status'] === 'disputed');
    assert.equal(disputed.length, 1);
    assert(disputed[0].links[0].includes('threads.com/@wwp_education/'));
    assert(disputed[0].body.includes('09/03/25') && disputed[0].body.includes('09/04/25'));
    const goal = social.find(r => r.links[0].includes('instagram.com/p/DOK9TncEj86/'));
    assert.equal(goal.attrs['data-ownership'], 'external-or-unverified');
    assert(social.every(r => !/\b\d{1,2}:\d{2}\b/.test(r.body)));
});

test('qualifications, aliases and excluded context cannot inflate either 2025 total', () => {
    assert(record('02').body.includes('direct URL returned 403'));
    assert(record('04').body.includes('not full web text'));
    assert(record('15').body.includes('not an additional independently originated story or an Eva Lau interview'));
    assert.equal(records(edu, 'context-2025').length, 2);
    for (const id of ['618207', '607889', '607890']) assert(!pm.includes('newsId=' + id));
    assert(!edu.includes('threads.com/@mabel_mi/'));
    assert(!/\b37 (publication|coverage|editorial)/.test(pm));
    assert(edu.includes('project-management.html#coverage-sources-2025'));
    assert(pm.includes('education-culture.html#teacher-survey-2025-social'));
});
