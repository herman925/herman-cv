const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const html = Object.fromEntries(['index', 'counselling', 'project-management', 'education-culture', 'technology'].map(name => [name, read(name + '.html')]));

test('home previews use defined evidence units instead of stale totals or reach claims', () => {
    const home = html.index;
    assert.match(home, /Non-Chinese-speaking students and families/);
    assert.match(home, /Research interviews and counselling/);
    assert.match(home, /Countries represented by workshop participants/);
    assert.match(home, /Research &amp;<br>teaching materials/);
    assert.match(home, /Research-to-public campaigns · 2025–2026/);
    assert.match(home, /project-management\.html#research-media-reader/);
    assert.doesNotMatch(home, /Families counselled|Countries reached|Press outlets|INNOVATIONS SHIPPED|PM1277/);
});
test('the full canonical workspace replaces selected-project controls without duplicating data', () => {
    assert.doesNotMatch(html.technology, /selected-projects|data-featured-project|project-console|project-command/);
    assert.match(html.technology, /id="project-desktop"/);
    assert.match(html.technology, /id="portfolio-finder"[^>]*hidden/);
    assert.equal((html.technology.match(/id="career-terminal"/g) || []).length, 1);
    assert.equal((html.technology.match(/id="explorer-grid"/g) || []).length, 1);
    assert.match(html.technology, /js\/project-desktop\.js/);
    assert.doesNotMatch(html.technology, /All Still Running|significant working memory improvement|One builder, one problem/);
});
test('practice evidence precedes memoir and breathing while preserved philosophy remains available', () => {
    const counselling = html.counselling;
    assert(counselling.indexOf('id="impact"') < counselling.indexOf('id="memoir"'));
    assert(counselling.indexOf('id="impact"') < counselling.indexOf('Before anything else'));
    assert.match(counselling, /Registration of Counsellor[\s\S]*?in progress/);
    assert.equal((counselling.match(/class="practice-record"/g) || []).length, 3);
    assert.doesNotMatch(counselling, /boosting team|developed\s+emotional resilience|Transformed 'difficult'/);
    assert.match(html['project-management'], /<details id="leadership-approach"/);
    for (const trait of ['Empathic', 'Focused', 'Transparent', 'Culturally sensitive']) assert(html['project-management'].includes(trait));
});
test('new semantic jump links resolve and every page retains unique IDs', () => {
    for (const [name, source] of Object.entries(html)) {
        const ids = [...source.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
        assert.equal(new Set(ids).size, ids.length, name + ' duplicate IDs');
        const jumps = [...source.matchAll(/href="#([^"]+)"/g)].map(m => m[1]);
        jumps.forEach(id => assert(ids.includes(id), name + ' missing ' + id));
    }
    assert.match(html['education-culture'], /href="#pecera-2026"/);
    assert.match(html['education-culture'], /href="#teaching-materials"/);
});
