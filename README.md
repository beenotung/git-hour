# git-hour

Briefly shows how much hours each contributor spent on a git repository

[![npm Package Version](https://img.shields.io/npm/v/git-hour.svg?maxAge=2592000)](https://www.npmjs.com/package/git-hour)

## Usage Without Installation
```bash
npx git-hour [directory]
```

## Installation (Optional)
```bash
# install with npm
npm i -g git-hour

# or install with pnpm
pnpm i -g git-hour

# ready to use
git-hour [directory]
```

## Usage Options
```bash
# run under current git directory
git-hour

# or run on specify directory
git-hour ~/workspace/github.com/beenotung/tslib
```

## Todo
- [ ] Allow cli to customize duration of `maximum interval between commits in a session` and `minimum duration before initial commit in the session`
- [ ] Use average interval in each session to adjust initial commit

## Similar works
- [git-time](https://github.com/vmf91/git-time) does not distinct each contributor
- [git-times](https://github.com/kimmobrunfeldt/git-hours) does not work with npx (probably due to dependency on the tricky nodegit)

