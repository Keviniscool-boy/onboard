import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./fingerprint.mjs', import.meta.url));

function run(root, expected) {
  const args = [script, root];
  if (expected) args.push(expected);
  return spawnSync(process.execPath, args, { encoding: 'utf8' });
}

function value(output) {
  return output.match(/^fingerprint: ([a-f0-9]{64})$/m)?.[1];
}

test('Git fingerprint changes with material, ignores secrets and decomposition', () => {
  const root = mkdtempSync(join(tmpdir(), 'onboard-fingerprint-'));
  try {
    execFileSync('git', ['init', '-q', root]);
    writeFileSync(join(root, 'README.md'), 'first');
    execFileSync('git', ['-C', root, 'add', 'README.md']);
    execFileSync('git', ['-C', root, '-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-qm', 'initial']);
    const first = value(run(root).stdout);
    assert.ok(first);
    assert.equal(run(root, first).status, 0);

    mkdirSync(join(root, '项目拆解包'));
    writeFileSync(join(root, '项目拆解包', '总览.md'), 'notes');
    writeFileSync(join(root, '.env'), 'secret');
    assert.equal(value(run(root).stdout), first);

    writeFileSync(join(root, '.env.example'), 'PUBLIC_SETTING=1');
    assert.equal(run(root, first).status, 1);
    rmSync(join(root, '.env.example'));

    writeFileSync(join(root, 'README.md'), 'second');
    const changed = run(root, first);
    assert.equal(changed.status, 1);
    assert.match(changed.stdout, /comparison: changed/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('ordinary folder fingerprint excludes secrets and notices new documents', () => {
  const root = mkdtempSync(join(tmpdir(), 'onboard-folder-'));
  try {
    writeFileSync(join(root, 'notes.md'), 'first');
    const first = value(run(root).stdout);
    writeFileSync(join(root, '.env.local'), 'secret');
    assert.equal(value(run(root).stdout), first);
    writeFileSync(join(root, '.env.example'), 'PUBLIC_SETTING=1');
    assert.equal(run(root, first).status, 1);
    rmSync(join(root, '.env.example'));
    writeFileSync(join(root, 'new.md'), 'second');
    assert.equal(run(root, first).status, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
