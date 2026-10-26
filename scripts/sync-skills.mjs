#!/usr/bin/env node
// 单源发布：根目录是唯一编辑处，本脚本把成果复制进 Claude 插件布局。
// 改完源码/文档后运行一次，再跑 node --test scripts/*.test.mjs 验证一致。
import { copyFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const pluginDir = join(root, 'skills', 'onboard');

rmSync(join(pluginDir, 'scripts'), { recursive: true, force: true });
mkdirSync(join(pluginDir, 'scripts'), { recursive: true });
copyFileSync(join(root, 'SKILL.md'), join(pluginDir, 'SKILL.md'));
copyFileSync(join(root, 'scripts', 'inventory.mjs'), join(pluginDir, 'scripts', 'inventory.mjs'));
copyFileSync(join(root, 'scripts', 'fingerprint.mjs'), join(pluginDir, 'scripts', 'fingerprint.mjs'));
console.log('已同步到 skills/onboard/（SKILL.md + scripts/）');
