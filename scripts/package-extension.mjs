#!/usr/bin/env node

/**
 * I was honestly going to use a library for zipping, but Codex randomly decided
 * to one-shot a full ZIP implementation, raw file headers and all. So screw it.
 */

import { spawn } from 'node:child_process';
import { constants } from 'node:fs';
import { access, cp, mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { basename, join, relative, sep } from 'node:path';
import { deflateRawSync } from 'node:zlib';

const TARGETS = new Set(['chrome', 'firefox']);
const ZIP_LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const ZIP_CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;
const ZIP_VERSION_NEEDED = 20;
const ZIP_VERSION_MADE_BY = 20;
const ZIP_COMPRESSION_DEFLATE = 8;

const rootDir = join(import.meta.dirname, '..');
const artifactsDir = join(rootDir, 'web-ext-artifacts');

const target = process.argv[2];
if (!TARGETS.has(target)) {
  console.error(`Usage: node scripts/${basename(import.meta.filename)} <chrome|firefox>`);
  process.exit(1);
}

const stageDir = join(artifactsDir, `${target}-package`);

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
      shell: false,
    });

    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
    });
  });
}

function getPnpmCommand() {
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
}

async function assertPathExists(path) {
  try {
    await access(path, constants.R_OK);
  } catch {
    throw new Error(`Expected ${path} to exist before packaging.`);
  }
}

function formatJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function readManifest() {
  return JSON.parse(await readFile(join(rootDir, 'manifest.json'), 'utf8'));
}

function makeTargetManifest(manifest) {
  const targetManifest = structuredClone(manifest);

  if (target === 'chrome') {
    delete targetManifest.browser_specific_settings;
    delete targetManifest.background?.scripts;
  } else {
    delete targetManifest.background?.service_worker;
  }

  return targetManifest;
}

function makeCrc32Table() {
  const table = new Uint32Array(256);

  for (let n = 0; n < table.length; n += 1) {
    let crc = n;

    for (let k = 0; k < 8; k += 1) {
      crc = (crc & 1) ? (0xedb88320 ^ (crc >>> 1)) : (crc >>> 1);
    }

    table[n] = crc >>> 0;
  }

  return table;
}

const crc32Table = makeCrc32Table();

function crc32(buffer) {
  let crc = 0xffffffff;

  for (const byte of buffer) {
    crc = crc32Table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function getDosDateParts(date = new Date()) {
  const year = Math.max(1980, Math.min(2107, date.getFullYear()));
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = Math.floor(date.getSeconds() / 2);

  return {
    date: ((year - 1980) << 9) | (month << 5) | day,
    time: (hours << 11) | (minutes << 5) | seconds,
  };
}

function makeLocalFileHeader(entry) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(ZIP_LOCAL_FILE_HEADER_SIGNATURE, 0);
  header.writeUInt16LE(ZIP_VERSION_NEEDED, 4);
  header.writeUInt16LE(0x0800, 6);
  header.writeUInt16LE(ZIP_COMPRESSION_DEFLATE, 8);
  header.writeUInt16LE(entry.dosTime, 10);
  header.writeUInt16LE(entry.dosDate, 12);
  header.writeUInt32LE(entry.crc, 14);
  header.writeUInt32LE(entry.compressedSize, 18);
  header.writeUInt32LE(entry.uncompressedSize, 22);
  header.writeUInt16LE(entry.name.length, 26);
  header.writeUInt16LE(0, 28);

  return header;
}

function makeCentralDirectoryHeader(entry) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(ZIP_CENTRAL_DIRECTORY_SIGNATURE, 0);
  header.writeUInt16LE(ZIP_VERSION_MADE_BY, 4);
  header.writeUInt16LE(ZIP_VERSION_NEEDED, 6);
  header.writeUInt16LE(0x0800, 8);
  header.writeUInt16LE(ZIP_COMPRESSION_DEFLATE, 10);
  header.writeUInt16LE(entry.dosTime, 12);
  header.writeUInt16LE(entry.dosDate, 14);
  header.writeUInt32LE(entry.crc, 16);
  header.writeUInt32LE(entry.compressedSize, 20);
  header.writeUInt32LE(entry.uncompressedSize, 24);
  header.writeUInt16LE(entry.name.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(entry.offset, 42);

  return header;
}

function makeEndOfCentralDirectory(entryCount, centralDirectorySize, centralDirectoryOffset) {
  const record = Buffer.alloc(22);
  record.writeUInt32LE(ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE, 0);
  record.writeUInt16LE(0, 4);
  record.writeUInt16LE(0, 6);
  record.writeUInt16LE(entryCount, 8);
  record.writeUInt16LE(entryCount, 10);
  record.writeUInt32LE(centralDirectorySize, 12);
  record.writeUInt32LE(centralDirectoryOffset, 16);
  record.writeUInt16LE(0, 20);

  return record;
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...await listFiles(path));
      continue;
    }

    if (entry.isFile()) {
      files.push(path);
    }
  }

  return files;
}

function toZipPath(path) {
  return relative(stageDir, path).split(sep).join('/');
}

async function writeZip(sourceDir, zipPath) {
  const files = (await listFiles(sourceDir)).sort((a, b) => toZipPath(a).localeCompare(toZipPath(b)));
  const fileParts = [];
  const centralDirectoryParts = [];
  const metadata = [];
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(toZipPath(file), 'utf8');
    const content = await readFile(file);
    const compressedContent = deflateRawSync(content);
    const { date, time } = getDosDateParts((await stat(file)).mtime);
    const entry = {
      name,
      crc: crc32(content),
      compressedSize: compressedContent.length,
      uncompressedSize: content.length,
      dosDate: date,
      dosTime: time,
      offset,
    };
    const localFileHeader = makeLocalFileHeader(entry);

    fileParts.push(localFileHeader, name, compressedContent);
    metadata.push(entry);
    offset += localFileHeader.length + name.length + compressedContent.length;
  }

  const centralDirectoryOffset = offset;

  for (const entry of metadata) {
    const centralDirectoryHeader = makeCentralDirectoryHeader(entry);
    centralDirectoryParts.push(centralDirectoryHeader, entry.name);
    offset += centralDirectoryHeader.length + entry.name.length;
  }

  const centralDirectorySize = offset - centralDirectoryOffset;
  const endRecord = makeEndOfCentralDirectory(metadata.length, centralDirectorySize, centralDirectoryOffset);

  await writeFile(zipPath, Buffer.concat([...fileParts, ...centralDirectoryParts, endRecord]));
}

async function removeSourceMaps(dir) {
  const files = await listFiles(dir);

  await Promise.all(
    files
      .filter(file => file.endsWith('.map'))
      .map(file => rm(file)),
  );
}

async function stagePackage(manifest) {
  await rm(stageDir, { recursive: true, force: true });
  await mkdir(stageDir, { recursive: true });

  await writeFile(join(stageDir, 'manifest.json'), formatJson(makeTargetManifest(manifest)));
  await cp(join(rootDir, 'icons'), join(stageDir, 'icons'), { recursive: true });
  await cp(join(rootDir, 'dist'), join(stageDir, 'dist'), { recursive: true });
  await removeSourceMaps(join(stageDir, 'dist'));
}

async function main() {
  const manifest = await readManifest();
  const zipPath = join(artifactsDir, `fancy-hn-${target}-v${manifest.version}.zip`);

  console.log(`Building ${target} extension...`);
  await run(getPnpmCommand(), ['run', `build:${target === 'chrome' ? 'chromium' : 'firefox'}`]);

  await assertPathExists(join(rootDir, 'dist', 'content', 'content.js'));
  await assertPathExists(join(rootDir, 'dist', 'content', 'anti-fouc.js'));
  await assertPathExists(join(rootDir, 'dist', 'content', 'assets', 'style.css'));
  await assertPathExists(join(rootDir, 'dist', 'background', 'background.js'));

  await mkdir(artifactsDir, { recursive: true });
  await rm(zipPath, { force: true });
  await stagePackage(manifest);
  await writeZip(stageDir, zipPath);

  console.log(`Created ${zipPath}`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
