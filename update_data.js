const fs = require('fs');
const https = require('https');
const path = require('path');

const DEFAULT_API_BASE = 'https://hub.mowangs.com/client/sjzgetdata/?id=';
const DEFAULT_MCU_HEADER = 'cb3c84ee';
const DATA_FILE = path.join(__dirname, 'mowang_data.json');

function getArg(name, fallback) {
  const prefix = `--${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : fallback;
}

function toInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readExistingData() {
  if (!fs.existsSync(DATA_FILE)) {
    return {};
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(data, null, 2)}\n`);
}

function fetchConfig(id, apiBase, mcuHeader) {
  return new Promise((resolve, reject) => {
    const url = `${apiBase}${id}`;
    https
      .get(url, { headers: { mcu: mcuHeader } }, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (error) {
            reject(new Error(`ID ${id} returned invalid JSON: ${error.message}`));
          }
        });
      })
      .on('error', reject);
  });
}

async function main() {
  const existing = readExistingData();
  const ids = Object.keys(existing).map((id) => Number.parseInt(id, 10)).filter(Number.isFinite);
  const maxExistingId = ids.length > 0 ? Math.max(...ids) : 0;

  const start = toInt(getArg('start', ''), maxExistingId + 1);
  const end = toInt(getArg('end', ''), start + 500);
  const delay = toInt(getArg('delay', ''), 30);
  const stopAfterEmpty = toInt(getArg('stop-empty', ''), 100);
  const saveEvery = toInt(getArg('save-every', ''), 100);
  const apiBase = getArg('api', DEFAULT_API_BASE);
  const mcuHeader = getArg('mcu', DEFAULT_MCU_HEADER);

  let added = 0;
  let checked = 0;
  let consecutiveEmpty = 0;

  console.log(`Updating data: ID ${start}-${end}`);
  console.log(`API: ${apiBase}`);
  console.log(`Existing entries: ${Object.keys(existing).length}`);

  for (let id = start; id <= end; id += 1) {
    if (existing[id]) {
      checked += 1;
      consecutiveEmpty = 0;
      continue;
    }

    try {
      const json = await fetchConfig(id, apiBase, mcuHeader);
      checked += 1;

      if (json && json.status === 200 && json.Data) {
        existing[id] = json.Data;
        added += 1;
        consecutiveEmpty = 0;
        console.log(`OK   ID ${id} added (${added} new)`);
      } else {
        consecutiveEmpty += 1;
      }
    } catch (error) {
      checked += 1;
      consecutiveEmpty += 1;
      console.warn(`WARN ID ${id}: ${error.message}`);
    }

    if (checked % saveEvery === 0) {
      saveData(existing);
      console.log(`Saved progress at ID ${id}; total ${Object.keys(existing).length}`);
    }

    if (consecutiveEmpty >= stopAfterEmpty) {
      console.log(`Stopped after ${consecutiveEmpty} consecutive empty IDs at ${id}`);
      break;
    }

    if (delay > 0) {
      await sleep(delay);
    }
  }

  saveData(existing);
  console.log(`Done. Checked ${checked}, added ${added}, total ${Object.keys(existing).length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
