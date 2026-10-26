#!/usr/bin/env node
// 发布前离线检查：版本一致、frontmatter 可解析、脚本引用在两种安装布局下都能解析、
// CHANGELOG 记录了当前版本。零依赖，CI 与本地都可跑。发现问题时退出码 1。
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const problems = [];
const check = (ok, message) => { if (!ok) problems.push(message); };

function read(path) {
  return readFileSync(join(root, path), 'utf8');
}

// 1. 版本三方一致：plugin.json、marketplace.json、CHANGELOG
let plugin, marketplace;
try {
  plugin = JSON.parse(read('.claude-plugin/plugin.json'));
  marketplace = JSON.parse(read('.claude-plugin/marketplace.json'));
} catch (e) {
  problems.push(`插件元数据 JSON 解析失败: ${e.message}`);
}
if (plugin && marketplace) {
  check(plugin.version === marketplace.plugins?.[0]?.version,
    `plugin.json (${plugin.version}) 与 marketplace.json (${marketplace.plugins?.[0]?.version}) 版本不一致`);
  check(/^\d+\.\d+\.\d+$/.test(plugin.version), `版本号不符合 x.y.z: ${plugin.version}`);
  check(read('CHANGELOG.md').includes(`## ${plugin.version}`),
    `CHANGELOG.md 缺少 ${plugin.version} 的条目`);
}

// 2. SKILL.md frontmatter 可解析，name 与插件一致，description 非空
const skill = read('SKILL.md');
const fm = skill.match(/^---\n([\s\S]*?)\n---\n/);
check(fm !== null, 'SKILL.md 缺少 frontmatter');
if (fm) {
  check(/^name:\s*\S/m.test(fm[1]), 'frontmatter 缺少 name');
  check(/^description:\s*\S/m.test(fm[1]), 'frontmatter 缺少 description');
  if (plugin) check(new RegExp(`^name:\\s*${plugin.name}\\s*$`, 'm').test(fm[1]),
    `frontmatter name 与 plugin.json (${plugin.name}) 不一致`);
}

// 3. SKILL.md 引用的脚本在直接安装与插件布局下都存在
const refs = [...skill.matchAll(/node\s+(scripts\/[\w.-]+\.mjs)/g)].map(m => m[1]);
check(refs.length > 0, 'SKILL.md 没有引用任何脚本');
for (const ref of refs) {
  check(existsSync(join(root, ref)), `直接安装布局缺少 ${ref}`);
  check(existsSync(join(root, 'skills/onboard', ref)), `插件布局缺少 skills/onboard/${ref}`);
}

// 4. 两种布局内容一致（与 package.test.mjs 同口径，这里作为独立发布检查再跑一遍）
for (const [direct, pluginPath] of [
  ['SKILL.md', 'skills/onboard/SKILL.md'],
  ['scripts/inventory.mjs', 'skills/onboard/scripts/inventory.mjs'],
  ['scripts/fingerprint.mjs', 'skills/onboard/scripts/fingerprint.mjs'],
]) {
  let a, b;
  try { a = read(direct); b = read(pluginPath); } catch { continue; }
  check(a === b, `${direct} 与 ${pluginPath} 内容不一致（先跑 node scripts/sync-skills.mjs）`);
}

// 5. 基础文件在场
for (const file of ['LICENSE', 'README.md', 'CHANGELOG.md', 'evals/README.md',
  'scripts/sync-skills.mjs', '.claude-plugin/marketplace.json']) {
  check(existsSync(join(root, file)), `缺少 ${file}`);
}

if (problems.length) {
  console.error(`发布检查未通过（${problems.length} 项）：`);
  for (const p of problems) console.error(`- ${p}`);
  process.exit(1);
}
console.log(`发布检查通过：v${plugin?.version}，脚本引用 ${refs.length} 处，双布局一致。`);
