const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({ document: { addEventListener() {} } });
for (const file of ['github-cards.js', 'project-valuations.js', 'explorer.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', file), 'utf8'), context);
}
const { projects, files } = JSON.parse(vm.runInContext('JSON.stringify({ projects: githubCardData, files: collectProjects() })', context));

test('Recent Work aliases do not duplicate or orphan projects', () => {
    assert.equal(files.length, 37);
    assert.equal(new Set(files.map(file => file.id)).size, files.length);
    assert.deepEqual(files.map(file => file.id).sort(), Object.keys(projects).sort());
    assert(files.every(file => projects[file.id].valuation));
});

test('every new estimate has an auditable positive range and itemised total', () => {
    const estimates = Object.values(projects).map(project => project.valuation).filter(value => value.model);
    assert.equal(estimates.length, 18);
    for (const value of estimates) {
        assert(value.low > 0 && value.high >= value.low);
        assert.equal(value.low, value.items.reduce((sum, item) => sum + item.low, 0));
        assert.equal(value.high, value.items.reduce((sum, item) => sum + item.high, 0));
        assert(value.items.every(item => item.lowDays > 0 && item.highDays >= item.lowDays));
        assert.match(value.model.sourceUrl, /^https:\/\/www\.morganmckinley\.com\//);
    }
});

test('preparation and specification estimates price the described limited scope', () => {
    assert.equal(projects.citereflex.valuation.low, 27000);
    assert.equal(projects.citereflex.valuation.high, 80000);
    assert.match(projects.citereflex.valuation.rationale, /Excludes the proposed future software build/);
    assert.equal(projects['equalplay-posture'].valuation.low, 18000);
    assert.equal(projects['equalplay-posture'].valuation.high, 60000);
    assert.match(projects['equalplay-posture'].valuation.rationale, /Excludes hardware fabrication/);
    assert.match(projects.equalplay.valuation.rationale, /do not sum/);
});

test('historical valuation examples retain their original amounts', () => {
    assert.equal(projects['masterlist-osp'].valuation.total, 'HKD $2.2M+');
    assert.equal(projects['gen3-server'].valuation.total, 'HKD $1.85M+');
    assert.equal(Object.values(projects).filter(project => !project.valuation.model).length, 19);
});
