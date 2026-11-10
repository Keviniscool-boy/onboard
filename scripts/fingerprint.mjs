#!/usr/bin/env node
// 只读地计算材料指纹：哈希文件元数据，小文件额外哈希内容，
// 等大小、等修改时间的改写也能检出。敏感命名的文件绝不读取、绝不外报，
// 材料数据不出本机。
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, realpathSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const rootArg = process.argv[2] || '.';
const expected = process.argv[3];
const GIT_COMMON = ['-c', 'core.fsmonitor=false']; // 每次都禁用仓库配置的监控钩子，避免扫描触发第三方命令或被拖慢
const GIT_STATUS_ARGS = ['status', '--porcelain=v1', '-z', '--untracked-files=all'];
const CONTENT_CAP = 512 * 1024;          // 不超过此大小的文件按内容哈希
const MAX_GIT_OUTPUT = 64 * 1024 * 1024; // 上限防止大仓库把子进程输出缓冲撑爆
const GIT_TIMEOUT = 30_000;
const MAX_NESTED_DEPTH = 5;
// 与 inventory.mjs 的 EXCLUDE_DIRS 保持同一份资料边界（package.test 断言一致）：
// 构建产物目录的变化不算材料变化，否则每次编译都会误触发「材料已变」。
const OMITTED_DIRS = new Set(['node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt',
  '__pycache__', '.venv', 'venv', 'env', 'target', 'vendor', 'coverage', '.gradle', '.idea',
  '.vscode', 'site-packages', 'Pods', 'DerivedData', '__MACOSX', '.terraform', '项目拆解包']);
const SECRET_NAME = /^(?:\.env(?:\..*)?|.*\.(?:pem|key|p12|pfx|jks|keystore)$|id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?$|\.npmrc$|\.netrc$|\.git-credentials$|.*credentials?\.json$|service-account.*\.json$|.*\.secret\.[^/]*$|secrets?\.[^/]*$)/i;

const notes = [];

function normalizeRoot(p) {
  try { p = realpathSync(p); } catch { /* 解析失败就沿用已解析的路径 */ }
  return process.platform === 'win32' ? p.toLowerCase() : p;
}

function sortedEntries(dir) {
  // 读不了的目录（无权限等）按空处理并登记，不让整次指纹计算崩溃，与盘点脚本同一容错口径。
  let entries;
  try { entries = readdirSync(dir, { withFileTypes: true }); }
  catch { notes.push(`unreadable dir: ${relative(root, dir) || '.'}`); return []; }
  entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return entries;
}

function include(path) {
  const parts = path.replaceAll('\\', '/').split('/');
  return !parts.some(part => {
    if (/^\.env\.(?:example|sample|template)$/i.test(part)) return false;
    return OMITTED_DIRS.has(part) || SECRET_NAME.test(part);
  });
}

// 递归计算一个目录的指纹，感知版本库。根目录用它，
// 外层版本库看不见的嵌套仓库也用它，深度逐层递减直到上限。
function fingerprint(dir, depth) {
  const hash = createHash('sha256');
  let files = 0;
  let bytes = 0;

  const mix = line => { hash.update(`${line}\n`); };
  const add = path => {
    if (!include(path)) return;
    const full = join(dir, path);
    let info;
    try { info = lstatSync(full); } catch { notes.push(`unreadable: ${path}`); return; }
    if (!info.isFile()) return;
    files++;
    bytes += info.size;
    if (info.size <= CONTENT_CAP) {
      try {
        mix(`${path.replaceAll('\\', '/')}\0${info.size}\0c:${createHash('sha256').update(readFileSync(full)).digest('hex')}`);
        return;
      } catch { notes.push(`unreadable: ${path}`); }
    }
    mix(`${path.replaceAll('\\', '/')}\0${info.size}\0m:${info.mtimeMs}`);
  };
  const walk = current => {
    for (const item of sortedEntries(current)) {
      const full = join(current, item.name);
      const path = relative(dir, full);
      if (!include(path) || item.isSymbolicLink()) continue;
      if (item.isDirectory()) walk(full);
      else if (item.isFile()) add(path);
    }
  };
  const gitRun = (args, { fatal = false } = {}) => {
    try {
      return execFileSync('git', ['-C', dir, ...GIT_COMMON, ...args],
        { encoding: 'utf8', maxBuffer: MAX_GIT_OUTPUT, timeout: GIT_TIMEOUT, stdio: ['ignore', 'pipe', 'ignore'] });
    } catch (e) {
      if (fatal) {
        console.error(`git ${args[0]} failed: ${String(e.message).slice(0, 160)}`);
        console.error('材料指纹无法可靠计算（Git 调用失败）。不要把这次的输出当作「材料未变」的依据。');
        process.exit(2);
      }
      return null;
    }
  };

  let mode = 'files';
  let head = '';
  // dir 是仓库根 ⇔ rev-parse --show-toplevel 成功且 --show-prefix 为空。
  // 用 git 自己的原语判断，避免跨平台路径大小写/短路径（8.3）比较问题。
  const topLevel = gitRun(['rev-parse', '--show-toplevel']);
  let isRepo = false;
  if (topLevel !== null) {
    const prefix = gitRun(['rev-parse', '--show-prefix']);
    isRepo = prefix !== null && prefix.trim() === '';
  }

  if (isRepo && depth <= MAX_NESTED_DEPTH) {
    mode = 'git';
    const headOut = gitRun(['rev-parse', 'HEAD']);
    if (headOut === null) notes.push('仓库还没有提交（unborn HEAD），指纹基于工作区状态');
    else { head = headOut.trim(); mix(`HEAD\0${head}`); }

    const status = gitRun(GIT_STATUS_ARGS, { fatal: true });
    const entries = status.split('\0').filter(Boolean);
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const path = entry.slice(3);
      const renamed = entry[0] === 'R' || entry[1] === 'R' || entry[0] === 'C' || entry[1] === 'C';
      const original = renamed ? entries[++i] : '';
      const pathOk = include(path);
      const originalOk = original ? include(original) : false;
      if (!pathOk && !originalOk) continue; // 新旧两侧都被过滤：按设计跳过
      // 改名跨过过滤边界时指纹必须变化，所以新旧路径都要参与混合。
      mix(`${entry.slice(0, 2)}\0${pathOk ? path : '[filtered]'}\0${originalOk ? original : original ? '[filtered]' : ''}`);
      // 未跟踪的新材料在这里就地做内容哈希；已跟踪的小文件在下面按清单统一哈希。
      // 原因：版本库的状态缓存会把等大小、等修改时间的已跟踪改写误判成无变化，
      // 状态输出也看不到这类改写。
      if (pathOk && entry.startsWith('??') && !entry.endsWith('/')) add(path);
    }

    // 被忽略的资料也是真材料（交接笔记、本地数据等），
    // 最新提交和状态输出都看不到它们，必须在这里显式哈希。
    const ignored = gitRun(['ls-files', '--others', '--ignored', '--exclude-standard', '-z'], { fatal: true });
    for (const path of ignored.split('\0').filter(Boolean)) add(path);

    // 已跟踪文件：小文件做内容哈希。只看最新提交会漏掉工作区里
    // 等大小、等修改时间的改写（状态缓存视为无变化），状态输出同样不报。
    const tracked = gitRun(['ls-files', '-z'], { fatal: true });
    for (const path of tracked.split('\0').filter(Boolean)) add(path);

    // 嵌套仓库在父库里只有一条粗粒度记录，
    // 所以要逐个递归取其自身指纹再混入总指纹。
    const nested = [];
    const findNested = current => {
      for (const item of sortedEntries(current)) {
        const full = join(current, item.name);
        const path = relative(dir, full);
        if (!include(path) || !item.isDirectory() || item.isSymbolicLink()) continue;
        const dotGit = join(full, '.git');
        let isNestedRepo = false;
        if (existsSync(dotGit)) {
          if (statSync(dotGit).isDirectory()) isNestedRepo = true;
          else {
            try { isNestedRepo = readFileSync(dotGit, 'utf8').slice(0, 8) === 'gitdir: '; } catch { isNestedRepo = false; }
          }
        }
        if (isNestedRepo && depth < MAX_NESTED_DEPTH) nested.push({ path, dir: full });
        else {
          if (isNestedRepo) notes.push(`嵌套仓库超过 ${MAX_NESTED_DEPTH} 层深度上限，未纳入指纹: ${path}`);
          if (!isNestedRepo) findNested(full);
        }
      }
    };
    findNested(dir);
    for (const { path, dir: sub } of nested) {
      const subFp = fingerprint(sub, depth + 1);
      mix(`nested\0${path.replaceAll('\\', '/')}\0${subFp.hash}\0${subFp.head ? `HEAD:${subFp.head}` : 'no-commit'}`);
    }
  } else {
    walk(dir);
  }

  return { hash: hash.digest('hex'), mode, head, files, bytes };
}

const root = normalizeRoot(resolve(rootArg));
if (!root || !existsSync(root) || !lstatSync(root).isDirectory()) {
  console.error(`Directory not found: ${rootArg}`);
  process.exit(2);
}

const result = fingerprint(root, 0);
console.log(`fingerprint: ${result.hash}`);
console.log(`mode: ${result.mode}${result.head ? `; HEAD: ${result.head}` : ''}`);
console.log(`fingerprinted files: ${result.files}; fingerprinted bytes: ${result.bytes}`);
if (notes.length) console.error(`notes:\n- ${notes.slice(0, 10).join('\n- ')}`);
if (expected) {
  const match = expected === result.hash;
  console.log(`comparison: ${match ? 'same' : 'changed'}`);
  if (!match) process.exitCode = 1;
}
