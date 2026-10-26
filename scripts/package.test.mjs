import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

test('direct install and Claude plugin contain the same skill and tools', () => {
  for (const [direct, plugin] of [
    ['SKILL.md', 'skills/onboard/SKILL.md'],
    ['scripts/inventory.mjs', 'skills/onboard/scripts/inventory.mjs'],
    ['scripts/fingerprint.mjs', 'skills/onboard/scripts/fingerprint.mjs'],
  ]) {
    assert.equal(
      readFileSync(join(root, direct), 'utf8'),
      readFileSync(join(root, plugin), 'utf8'),
      `${direct} differs from ${plugin}`,
    );
  }
});

test('plugin layout is self-contained: SKILL.md script references resolve inside skills/onboard', () => {
  const skill = readFileSync(join(root, 'skills/onboard/SKILL.md'), 'utf8');
  const refs = [...skill.matchAll(/node\s+(scripts\/[\w.-]+\.mjs)/g)].map(m => m[1]);
  assert.ok(refs.length > 0, 'SKILL.md should reference skill scripts');
  for (const ref of refs) {
    const inPlugin = join(root, 'skills/onboard', ref);
    assert.ok(existsSync(inPlugin), `plugin layout missing ${ref}`);
    const inDirect = join(root, ref);
    assert.ok(existsSync(inDirect), `direct install missing ${ref}`);
  }
});

test('both scripts share one secret-filter policy', () => {
  const pick = source => source.match(/^const SECRET_NAME = .*$/m)?.[0];
  const fingerprint = readFileSync(join(root, 'scripts/fingerprint.mjs'), 'utf8');
  const inventory = readFileSync(join(root, 'scripts/inventory.mjs'), 'utf8');
  assert.ok(pick(fingerprint), 'fingerprint.mjs must define SECRET_NAME');
  assert.equal(pick(fingerprint), pick(inventory), 'SECRET_NAME regex must be identical in both scripts');
});

test('Claude plugin metadata points to the packaged skill', () => {
  const plugin = JSON.parse(readFileSync(join(root, '.claude-plugin/plugin.json'), 'utf8'));
  const marketplace = JSON.parse(readFileSync(join(root, '.claude-plugin/marketplace.json'), 'utf8'));
  assert.equal(plugin.skills, './skills');
  assert.equal(plugin.version, marketplace.plugins[0].version);
});
