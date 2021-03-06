import { binArrayBy } from '@beenotung/tslib/array';
import { spawn } from '@beenotung/tslib/child_process';
import { MINUTE } from '@beenotung/tslib/time';

enum state {
  wait_commit,
  wait_author,
  wait_date,
}

const defaultState = state.wait_commit;

type Commit = {
  Author: string;
  Date: number;
};

export let config = {
  maxSessionDiff: 60 * MINUTE,
  minFirstSessionDuration: 5 * MINUTE,
};

export async function scanDir(options: { dir: string }) {
  const { dir } = options;
  let currentState = defaultState;

  function defaultOnline(line: string) {
    currentState = defaultState;
    online(line);
  }

  const commits: Commit[] = [];
  let commit: Commit;

  function online(line: string): void {
    switch (currentState) {
      case state.wait_commit:
        if (!line.startsWith('commit ')) {
          return;
        }
        commit = { Author: '', Date: 0 };
        currentState = state.wait_author;
        break;
      case state.wait_author:
        if (!line.startsWith('Author: ')) {
          return defaultOnline(line);
        }
        commit.Author = line.replace('Author: ', '');
        currentState = state.wait_date;
        break;
      case state.wait_date:
        if (!line.startsWith('Date: ')) {
          return defaultOnline(line);
        }
        commit.Date = new Date(line.replace('Date: ', '')).getTime();
        commits.push(commit);
        currentState = defaultState;
        break;
      default:
        return defaultOnline(line);
    }
  }

  function onend() {
    const { maxSessionDiff, minFirstSessionDuration } = config;
    return Array.from(
      binArrayBy(commits, commit => commit.Author).entries(),
    ).map(([Author, commits]) => {
      const times = commits.map(commit => commit.Date).sort((a, b) => a - b);
      const { AccDuration, AccCount, TotalDuration } = times.reduce(
        ({ LastTime, AccDuration, AccCount, TotalDuration }, c) => {
          const diff = c - LastTime;
          if (diff > maxSessionDiff) {
            // new session
            TotalDuration += AccDuration + minFirstSessionDuration;
            if (AccCount < 1) {
              TotalDuration += minFirstSessionDuration;
            } else {
              const avgDuration = AccDuration / AccCount;
              TotalDuration += Math.max(minFirstSessionDuration, avgDuration);
            }
            AccCount = 0;
            AccDuration = 0;
          } else {
            // same session
            AccDuration += diff;
            AccCount++;
          }
          LastTime = c;
          return { LastTime, AccDuration, AccCount, TotalDuration };
        },
        { LastTime: 0, AccDuration: 0, AccCount: 0, TotalDuration: 0 },
      );
      let Duration: number;
      if (AccCount < 1) {
        Duration = TotalDuration + minFirstSessionDuration;
      } else {
        const avgDuration = AccDuration / AccCount;
        Duration =
          TotalDuration + Math.max(minFirstSessionDuration, avgDuration);
      }
      return [Author, Duration] as [string, number];
    });
  }

  return spawn({
    cmd: 'git',
    args: ['log', '--all', '--full-history'],
    options: { cwd: dir },
    on_stdout: chunk => {
      chunk
        .toString()
        .split('\n')
        .forEach((line: string) => online(line));
    },
    on_stderr: chunk => {
      console.error(chunk);
    },
    on_error: error => {
      console.error(error);
      process.exit(1);
    },
  }).then(onend);
}
