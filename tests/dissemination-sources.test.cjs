const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const pm = fs.readFileSync(path.join(__dirname, '..', 'project-management.html'), 'utf8');
const edu = fs.readFileSync(path.join(__dirname, '..', 'education-culture.html'), 'utf8');
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&quot;', '"');
function entries(html, kind) {
    return [...html.matchAll(/<(li|p)\b([^>]*\bdata-source-kind="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g)]
        .filter(match => match[3] === kind)
        .map(match => ({
            attrs: Object.fromEntries([...match[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(attr => [attr[1], decode(attr[2])])),
            body: match[4],
            links: [...match[4].matchAll(/href="([^"]+)"/g)].map(link => decode(link[1]))
        }));
}
const editorial = entries(pm, 'editorial');

test('editorial totals describe unique publication pages and conservative publisher groups', () => {
    assert.equal(editorial.length, 24);
    assert.equal(new Set(editorial.flatMap(item => item.links).map(url => new URL(url).href)).size, 24);
    assert(editorial.every(item => item.links.length === 1));
    assert.equal(editorial.filter(item => item.attrs['data-item-type'] === 'article').length, 19);
    assert.equal(editorial.filter(item => item.attrs['data-item-type'] === 'programme').length, 5);
    assert.deepEqual([...new Set(editorial.map(item => item.attrs['data-publisher-group']))].sort(), [
        'Bastille Post', 'Commercial Radio', 'Epoch Times', 'HK Commercial Daily', 'HK01',
        'HKEJ', 'HKET', 'Metro Broadcast', 'Ming Pao', 'Now', 'Oriental/on.cc', 'RTHK',
        'Sing Tao/The Standard', 'TVB', 'Ta Kung/Wen Wei'
    ].sort());
});

test('excerpt-only sources and attribution qualifications remain visible in the ledger', () => {
    const excerpts = editorial.filter(item => item.attrs['data-evidence'] === 'excerpt-only');
    assert.deepEqual(excerpts.map(item => item.attrs.id), ['coverage-2026-03', 'coverage-2026-06']);
    assert(excerpts.every(item => item.body.includes('full subscription text not verified')));
    const freewind = editorial.find(item => item.attrs.id === 'coverage-2026-22');
    assert(freewind.body.includes('自由風自由PHONE｜教聯會調查發現近九成受訪教師關注融合教育資源'));
    assert(freewind.body.includes('not CNOPE'));
    for (const id of ['11', '12']) assert(editorial.find(item => item.attrs.id === 'coverage-2026-' + id).body.includes('independent reporting origin not established'));
});

test('Now segments and the RTHK simulcast do not inflate archived academic appearances', () => {
    const programmes = editorial.filter(item => item.attrs['data-item-type'] === 'programme');
    const appearances = new Map(programmes.map(item => [item.attrs['data-appearance-id'], item.attrs['data-academic-guest']]));
    assert.equal(appearances.size, 4);
    assert.equal([...appearances.values()].filter(guest => guest === 'Eva Lau').length, 3);
    assert.equal([...appearances.values()].filter(guest => guest === 'Carmen Choi').length, 1);
    const now = programmes.filter(item => item.attrs['data-publisher-group'] === 'Now');
    assert.equal(now.length, 2);
    assert.equal(new Set(now.map(item => item.attrs['data-appearance-id'])).size, 1);
    const distribution = entries(pm, 'distribution');
    assert.equal(distribution.length, 1);
    assert.equal(appearances.get(distribution[0].attrs['data-appearance-id']), 'Carmen Choi');
    assert.equal(new Set([...appearances.keys(), distribution[0].attrs['data-appearance-id']]).size, 4);
});

test('historical versions, social posts and institutional context stay outside the editorial ledger', () => {
    const history = entries(pm, 'historical-editorial');
    assert.equal(history.length, 3);
    assert(history.every(item => item.links.length === 0 && item.body.includes('Historically documented; live page not recovered')));
    assert.equal(entries(edu, 'editorial').length, 0);
    const social = entries(edu, 'owned-social');
    assert.equal(social.length, 4);
    assert.equal(new Set(social.flatMap(item => item.links)).size, 4);
    assert.deepEqual([...new Set(social.map(item => item.attrs['data-platform']))].sort(), ['Facebook', 'Instagram', 'X']);
    const institutional = entries(edu, 'institutional');
    assert.equal(institutional.length, 3);
    const editions = institutional.filter(item => item.attrs['data-release-family']);
    assert.equal(editions.length, 2);
    assert.equal(new Set(editions.map(item => item.attrs['data-release-family'])).size, 1);
    assert(edu.includes('project-management.html#coverage-sources-2026'));
    assert(!pm.includes('newsId=651793') && !edu.includes('/posts/1369993232006472'));
});

test('PECERA shows confirmed co-authorship and accepted/listed status without an unverified APA contribution type', () => {
    const paper = edu.match(/<article id="pecera-2026"[\s\S]*?<\/article>/)[0];
    assert(paper.includes('Third co-author'));
    assert(paper.includes('Accepted and listed for paper presentation'));
    const authors = ['Yi Hung Eva Lau', 'Ka Man Carmen Choi', 'Koon Kiu Herman Chan', 'Ming Wai Patricia Tang'];
    const positions = authors.map(author => paper.indexOf(author));
    assert(positions.every((position, i) => position >= 0 && (i === 0 || position > positions[i - 1])));
    assert(paper.includes('Eva Lau was the designated presenting author'));
    assert(paper.includes('Official conference context'));
    assert(!paper.includes('[Paper presentation]'));
    assert(!/\bDOI\b|in press|proceedings|July 11/.test(paper));
});
