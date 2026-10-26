import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs';
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

function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' });
}

function commitAll(root, message) {
  git(root, 'add', '-A');
  git(root, '-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-qm', message);
}

// 覆盖文件为等长内容并还原 mtime：验证内容哈希能抓住这种改写（H2）。
function rewriteSameSizeSameMtime(path, content) {
  const st = statSync(path);
  writeFileSync(path, content);
  utimesSync(path, st.atime, st.mtime);
}

test('Git fingerprint changes with material, ignores secrets and decomposition', () => {
  const root = mkdtempSync(join(tmpdir(), 'onboard-fingerprint-'));
  try {
    execFileSync('git', ['init', '-q', root]);
    writeFileSync(join(root, 'README.md'), 'first');
    commitAll(root, 'initial');
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

// H1：Git 仓库内被忽略的普通资料也是材料，变化必须反映到指纹。
test('H1: ignored material changes are detected', () => {
  const root = mkdtempSync(join(tmpdir(), 'onboard-h1-'));
  try {
    execFileSync('git', ['init', '-q', root]);
    writeFileSync(join(root, '.gitignore'), 'handover/\n');
    writeFileSync(join(root, 'README.md'), 'm');
    commitAll(root, 'init');
    const first = value(run(root).stdout);
    mkdirSync(join(root, 'handover'));
    writeFileSync(join(root, 'handover', 'guide.md'), 'NEW MATERIAL');
    const changed = run(root, first);
    assert.equal(changed.status, 1);
    assert.match(changed.stdout, /comparison: changed/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// H2：等长改写 + 还原 mtime，靠内容哈希检出。
test('H2: equal-size equal-mtime rewrites are detected (folder, untracked, tracked)', () => {
  const plain = mkdtempSync(join(tmpdir(), 'onboard-h2a-'));
  try {
    const p = join(plain, 'notes.md');
    writeFileSync(p, 'AAAA');
    const first = value(run(plain).stdout);
    rewriteSameSizeSameMtime(p, 'BBBB');
    assert.equal(run(plain, first).status, 1);
  } finally {
    rmSync(plain, { recursive: true, force: true });
  }

  const repo = mkdtempSync(join(tmpdir(), 'onboard-h2b-'));
  try {
    execFileSync('git', ['init', '-q', repo]);
    const tracked = join(repo, 'tracked.md');
    writeFileSync(tracked, 'AAAA');
    writeFileSync(join(repo, 'untracked.md'), 'AAAA');
    commitAll(repo, 'init');
    const first = value(run(repo).stdout);
    rewriteSameSizeSameMtime(tracked, 'BBBB');
    rewriteSameSizeSameMtime(join(repo, 'untracked.md'), 'BBBB');
    assert.equal(run(repo, first).status, 1);
  } finally {
    rmSync(repo, { recursive: true, force: true });
  }
});

// H3：嵌套仓库内部变化（父仓库始终只显示同一个 dirty 状态）必须改变指纹。
test('H3: nested repository internal changes are detected', () => {
  const root = mkdtempSync(join(tmpdir(), 'onboard-h3-'));
  try {
    const sub = join(root, 'sub');
    mkdirSync(sub);
    writeFileSync(join(root, 'README.md'), 'parent');
    writeFileSync(join(sub, 'a.txt'), 'v1');
    execFileSync('git', ['init', '-q', root]);
    execFileSync('git', ['init', '-q', sub]);
    commitAll(sub, 's1');
    commitAll(root, 'p1');
    const first = value(run(root).stdout);

    writeFileSync(join(sub, 'b.txt'), 'v2'); // 父仓库进入 dirty
    const second = value(run(root).stdout);
    assert.notEqual(second, first);

    writeFileSync(join(sub, 'b.txt'), 'v2-longer'); // 父仓库 dirty 状态不变
    const changed = run(root, second);
    assert.equal(changed.status, 1);
    assert.match(changed.stdout, /comparison: changed/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// M1：空仓库（无提交）不能崩溃，且要明确说明指纹不含 HEAD。
test('M1: empty repository does not crash and explains unborn HEAD', () => {
  const root = mkdtempSync(join(tmpdir(), 'onboard-m1-'));
  try {
    execFileSync('git', ['init', '-q', root]);
    writeFileSync(join(root, 'x.md'), 'hi');
    const r = run(root);
    assert.equal(r.status, 0);
    assert.ok(value(r.stdout));
    assert.match(r.stderr, /unborn HEAD/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

// M6：改名跨过敏感过滤边界时，指纹不能保持不变。
test('M6: rename across the secret filter changes the fingerprint', () => {
  const root = mkdtempSync(join(tmpdir(), 'onboard-m6-'));
  try {
    execFileSync('git', ['init', '-q', root]);
    writeFileSync(join(root, 'a.txt'), 'tracked content');
    commitAll(root, 'init');
    const first = value(run(root).stdout);
    git(root, 'mv', 'a.txt', '.env'); // 原路径可包含，新路径是敏感名
    assert.equal(run(root, first).status, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
