import { catchMain } from '@beenotung/tslib/node';
import { format_time_duration } from '@beenotung/tslib/format';
import { scanDir } from './core';

async function main(options: { dir: string }) {
  let { dir } = options;
  console.log('Directory:', dir);
  let records = await scanDir(options);
  records
    .sort((a, b) => a[1] - b[1])
    .forEach(([Author, Duration]) => {
      console.log(Author, ':', format_time_duration(Duration));
    })
  ;
}

let dir = process.argv[2] || '.';
catchMain(main({ dir }));
