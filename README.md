![](https://github.com/fission-suite/get-ipfs/raw/master/assets/logo.png?sanitize=true)

# Get IPFS

[![NPM](https://img.shields.io/npm/v/get-ipfs)](https://www.npmjs.com/package/get-ipfs)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/fission-suite/blob/master/LICENSE)
[![Build Status](https://travis-ci.org/fission-suite/get-ipfs.svg?branch=master)](https://travis-ci.org/fission-suite/get-ipfs)
[![Maintainability](https://api.codeclimate.com/v1/badges/8de358f51066211e246c/maintainability)](https://codeclimate.com/github/fission-suite/get-ipfs/maintainability)
[![Built by FISSION](https://img.shields.io/badge/⌘-Built_by_FISSION-purple.svg)](https://fission.codes)
[![Discord](https://img.shields.io/discord/478735028319158273.svg)](https://discord.gg/zAQBDEq)
[![Discourse](https://img.shields.io/discourse/https/talk.fission.codes/topics)](https://talk.fission.codes)

A one-stop shop for loading an ipfs instance into a webpage.

Attempts to load ipfs in the following order and returns the result in a Promise:
1. `window.ipfs.enable`: the current `window.ipfs` api. Available if the user is using Opera or has the ipfs-companion extension installed.
2. `window.ipfs`: the old `window.ipfs` api. Does not include enabling permissions all at once.
3. `js-ipfs`: an in-browser ipfs node that communicates via WebRTC/Websockets. The `js-ipfs` code is only loaded if required. 


## Usage
```
import getIpfs from 'get-ipfs'

const ipfs = await getIpfs([config])
```

### Config 
```
{
  // `permissions` are enabled if the browser is ipfs-capable (Opera or extension)
  // passed to `window.ipfs.enable` if available
  // prevents a permission dialog from appearing for every action
  permissions: ['id', 'version', 'add', 'cat', 'dag', 'swarm'],

  // `peers` is a list of peer multiaddrs to connect to on load
  // to work with the `js-ipfs` fallback, these must have available websocket ports
  peers: []

  // `browserPeers` is a list of peer multiaddrs to connect to only on fallback to an in-browser js-ipfs daemon
  // note: these must be secure websocket or WebRTC addresses
  browserPeers: []

  // `localPeers` is a list of peer multiaddrs to connect to if using a local ipfs daemon (through ipfs companion for instance)
  localPeers: []
}
```

## Testing
### Tests coming soon!!
- Run `npm i`
- Run tests with: `npm run test`
- Continuously watch with `npm run test:watch`

## Notes
This repo currently makes use of types from [typestub-ipfs](https://github.com/beenotung/typestub-ipfs). 

Give your support [here](https://github.com/ipfs/js-ipfs/issues/1166) for types to be merged into `js-ipfs` or `DefinitelyTyped`.

This repo is similar to [ipfs-provider](https://github.com/ipfs-shipyard/ipfs-provider). One big difference is that `ipfs-provider` doesn't use ES6 syntax so it can't be used without a module bundler.
