import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));

test('direct install and Claude plugin contain the same skill and tools', () => {
  for (const [direct, plugin] of [
    ['SKILL.md', 'skills/onboard/SKILL.md'],
    ['scripts/inventory.mjs', 'skills/inventory.mjs'],
    ['scripts/fingerprint.mjs', 'skills/fingerprint.mjs'],
  ]) {
    assert.equal(
      readFileSync(join(root, direct), 'utf8'),
      readFileSync(join(root, plugin), 'utf8'),
      `${direct} differs from ${plugin}`,
    );
  }
});

test('Claude plugin metadata points to the packaged skill', () => {
  const plugin = JSON.parse(readFileSync(join(root, '.claude-plugin/plugin.json'), 'utf8'));
  const marketplace = JSON.parse(readFileSync(join(root, '.claude-plugin/marketplace.json'), 'utf8'));
  assert.equal(plugin.skills, './skills');
  assert.equal(plugin.version, marketplace.plugins[0].version);
});
