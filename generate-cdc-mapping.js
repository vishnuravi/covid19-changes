const { parse } = require('node-html-parser');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

const CDC_UPDATES_PATH = path.join(__dirname, 'cdcupdates');
const PAGE_DIRS = ['summary', 'screening', 'management']; // directory names for scraped pages

const TEMPLATE = `
// This file is generated by running
// yarn run generate-mapping
// Do not modify this file directly
import raw from 'raw.macro';

export default {
  ::__LINES__::
}
`;

function capitalize (s){
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

async function run() {

  PAGE_DIRS.forEach(async (pageDir) => {
    const files = await fs.promises.readdir(`${CDC_UPDATES_PATH}/${pageDir}`);

    const objectLines = files
      .map(file => {
        const date = path.basename(file, '.txt');
        return `'${date}': raw('../cdcupdates/${pageDir}/${date}.txt'),`;
        // console.log(date);
      })
      .join('\n');

    const result = TEMPLATE.replace('::__LINES__::', objectLines);

    const prettierOptions = await prettier.resolveConfig(__filename);

    const DESTINATION = path.join(__dirname, 'src', `cdcUpdatesMapping${capitalize(pageDir)}.js`);

    const formatted = prettier.format(result, prettierOptions);
    fs.writeFileSync(DESTINATION, formatted);
  })

  // console.log(files);
  // const destination = path.join(CDC_UPDATES_PATH, `${shortDateString}.txt`);
  // if (fs.existsSync(destination)) {
  //   console.log('Already have', shortDateString, '... Skipping');
  //   return;
  // }
  // const result = await fetch(CDC_URL);
  // const html = await result.text();
  // const root = parse(html);
  // const content = root.querySelector('.content');
  // const cleanedContent = content.text
  //   .split('\n')
  //   .map(line => line.trim())
  //   .filter(Boolean)
  //   .join('\n');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
