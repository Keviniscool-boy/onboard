import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./inventory.mjs', import.meta.url));

function run(root, out) {
  const args = [script, root];
  if (out) args.push(out);
  return spawnSync(process.execPath, args, { encoding: 'utf8' });
}

function git(root, ...args) {
  return execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' });
}

function commitAll(root, message) {
  git(root, 'add', '-A');
  git(root, '-c', 'user.name=Test', '-c', 'user.email=test@example.com', 'commit', '-qm', message);
}

test('M2: non-directory input and missing argument fail with exit code 2', () => {
  const base = mkdtempSync(join(tmpdir(), 'onboard-inv-'));
  try {
    const file = join(base, 'plainfile.txt');
    writeFileSync(file, 'x');
    assert.equal(run(file).status, 2);
    assert.equal(spawnSync(process.execPath, [script], { encoding: 'utf8' }).status, 2);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test('M3/M17: sensitive-named files are registered as excluded, never read', () => {
  const base = mkdtempSync(join(tmpdir(), 'onboard-inv-secret-'));
  try {
    const root = join(base, '资料');
    mkdirSync(root);
    writeFileSync(join(root, '.env.production'), 'DB_PASS=topsecret');
    writeFileSync(join(root, 'service-account.json'), '{"private_key":"topsecret"}');
    writeFileSync(join(root, 'README.md'), '# fine');
    const out = join(base, 'inv.json');
    const r = run(root, out);
    assert.equal(r.status, 0);
    const result = JSON.parse(readArrayOf(out));
    assert.equal(result.totals.sensitiveExcluded, 2);
    assert.deepEqual(result.sensitiveFiles.sort(), ['.env.production', 'service-account.json']);
    assert.ok(!r.stdout.includes('topsecret'), 'secret content must not reach the terminal');
    assert.ok(!r.stdout.includes('private_key'), 'secret content must not reach the terminal');
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test('L1: line counting follows wc -l semantics', () => {
  const base = mkdtempSync(join(tmpdir(), 'onboard-inv-lines-'));
  try {
    const root = join(base, 'repo');
    mkdirSync(root);
    execFileSync('git', ['init', '-q', root]);
    writeFileSync(join(root, 'empty.py'), '');
    writeFileSync(join(root, 'two.py'), 'a=1\nb=2\n'); // 结尾换行不额外计一行
    writeFileSync(join(root, 'nonl.py'), 'a=1');       // 无结尾换行计 1 行
    commitAll(root, 'init');
    const out = join(base, 'inv.json');
    run(root, out);
    const result = JSON.parse(readArrayOf(out));
    const py = result.repos[0]?.languages.find(l => l.name === 'Python');
    assert.ok(py, 'python files should be counted');
    assert.equal(py.files, 3);
    assert.equal(py.lines, 3);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test('L2: document extension grouping is case-insensitive', () => {
  const base = mkdtempSync(join(tmpdir(), 'onboard-inv-case-'));
  try {
    const root = join(base, 'docs');
    mkdirSync(root);
    writeFileSync(join(root, 'a.MD'), 'x');
    writeFileSync(join(root, 'b.Md'), 'x');
    writeFileSync(join(root, 'c.md'), 'x');
    const out = join(base, 'inv.json');
    run(root, out);
    const result = JSON.parse(readArrayOf(out));
    assert.equal(result.docsByExt['.md'], 3);
    assert.equal(result.totals.docs, 3);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test('M14: writing the JSON inside the scanned folder does not pollute later scans', () => {
  const base = mkdtempSync(join(tmpdir(), 'onboard-inv-out-'));
  try {
    const root = join(base, '资料');
    mkdirSync(root);
    writeFileSync(join(root, 'a.md'), 'x');
    writeFileSync(join(root, 'b.md'), 'x');
    const out = join(root, 'inventory.json');
    run(root, out);
    const first = JSON.parse(readArrayOf(out));
    run(root, out); // 第二次：上次的输出已在文件夹里
    const second = JSON.parse(readArrayOf(out));
    assert.equal(second.totals.files, first.totals.files);
    assert.equal(second.totals.files, 2);
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test('M8/M9: truncation is reported structurally and honestly', () => {
  const base = mkdtempSync(join(tmpdir(), 'onboard-inv-trunc-'));
  try {
    const root = join(base, '资料');
    mkdirSync(root);
    for (let i = 0; i < 5; i++) writeFileSync(join(root, `doc-${i}.md`), 'x');
    const out = join(base, 'inv.json');
    const r = run(root, out);
    assert.equal(r.status, 0);
    const result = JSON.parse(readArrayOf(out));
    assert.equal(typeof result.totals.walkIncomplete, 'boolean');
    assert.equal(result.docListTruncated, 0);
    assert.equal(result.bigFilesTruncated, 0);
    assert.match(r.stdout, /清单完整/);

    // 小仓库也可能触发深度不完整？此处只验证标志存在且为布尔。
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

test('M15/M16: non-ASCII hot-file names stay readable and safe on the terminal', () => {
  const base = mkdtempSync(join(tmpdir(), 'onboard-inv-hot-'));
  try {
    const root = join(base, 'repo');
    mkdirSync(root);
    execFileSync('git', ['init', '-q', root]);
    const name = '中文模块.md';
    writeFileSync(join(root, name), 'x');
    commitAll(root, 'one');
    for (let i = 2; i <= 6; i++) {   // 攒够 5 个提交，热点清单才会打印
      writeFileSync(join(root, name), `v${i}`);
      commitAll(root, `c${i}`);
    }
    const r = run(root);
    assert.equal(r.status, 0);
    assert.ok(r.stdout.includes(name), `hot list should show the real name, got: ${r.stdout.split('\n').find(l => l.includes('热点'))}`);
    assert.ok(!/\\[0-9]{3}/.test(r.stdout), 'no octal-escaped names on the terminal');
  } finally {
    rmSync(base, { recursive: true, force: true });
  }
});

function readArrayOf(path) { return readFileSync(path, 'utf8'); }
