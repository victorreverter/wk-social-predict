import fs from 'fs';
import path from 'path';
import https from 'https';

const FLAG_DIR = path.join(process.cwd(), 'public', 'flags');

if (!fs.existsSync(FLAG_DIR)) {
    fs.mkdirSync(FLAG_DIR, { recursive: true });
}

// Map FIFA 3-letter codes to ISO 3166-1 alpha-2 for flagcdn.com
const codeMap = {
    'MEX': 'mx', 'RSA': 'za', 'KOR': 'kr',
    'CAN': 'ca', 'QAT': 'qa', 'SUI': 'ch',
    'BRA': 'br', 'MAR': 'ma', 'HAI': 'ht', 'SCO': 'gb-sct',
    'USA': 'us', 'PAR': 'py', 'AUS': 'au',
    'GER': 'de', 'CUW': 'cw', 'CIV': 'ci', 'ECU': 'ec',
    'NED': 'nl', 'JPN': 'jp', 'TUN': 'tn',
    'BEL': 'be', 'EGY': 'eg', 'IRN': 'ir', 'NZL': 'nz',
    'ESP': 'es', 'CPV': 'cv', 'KSA': 'sa', 'URU': 'uy',
    'FRA': 'fr', 'SEN': 'sn', 'NOR': 'no',
    'ARG': 'ar', 'ALG': 'dz', 'AUT': 'at', 'JOR': 'jo',
    'POR': 'pt', 'UZB': 'uz', 'COL': 'co',
    'ENG': 'gb-eng', 'CRO': 'hr', 'GHA': 'gh', 'PAN': 'pa'
};

const playoffs = ['PO-A', 'PO-B', 'PO-C', 'PO-D', 'IC-1', 'IC-2'];

const downloadFlag = (fifaCode, isoCode) => {
    const url = `https://flagcdn.com/${isoCode}.svg`;
    const dest = path.join(FLAG_DIR, `${fifaCode}.svg`);

    https.get(url, (res) => {
        if (res.statusCode === 200) {
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${fifaCode}.svg (${isoCode})`);
            });
        } else {
            console.error(`Failed to download ${isoCode} for ${fifaCode} - HTTP ${res.statusCode}`);
        }
    }).on('error', (err) => {
        console.error(`Error downloading ${fifaCode}.svg: `, err.message);
    });
};

const createPlaceholderFlag = (fifaCode) => {
    const dest = path.join(FLAG_DIR, `${fifaCode}.svg`);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 70" width="100" height="70">
  <rect width="100" height="70" fill="#2a2a35"/>
  <text x="50" y="45" font-family="Arial, sans-serif" font-size="30" font-weight="bold" fill="#6e6e73" text-anchor="middle">?</text>
</svg>`;
    fs.writeFileSync(dest, svg);
    console.log(`Created placeholder ${fifaCode}.svg`);
};

// Process mapped real teams
for (const [fifa, iso] of Object.entries(codeMap)) {
    downloadFlag(fifa, iso);
}

// Process unknown playoffs
playoffs.forEach(createPlaceholderFlag);
