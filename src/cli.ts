import { format_time_duration } from '@beenotung/tslib/format';
import { catchMain } from '@beenotung/tslib/node';
import { scanDir } from './core';

async function main(options: { dir: string }) {
  const { dir } = options;
  console.log('Directory:', dir);
  const records = await scanDir(options);
  records
    .sort((a, b) => a[1] - b[1])
    .forEach(([Author, Duration]) => {
      console.log(Author, ':', format_time_duration(Duration));
    });
}

const dir = process.argv[2] || '.';
catchMain(main({ dir }));
