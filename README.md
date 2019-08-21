![](https://github.com/fission-suite/get-ipfs/raw/master/assets/logo.png?sanitize=true)

# Get IPFS

[![Build Status](https://travis-ci.org/fission-suite/get-ipfs.svg?branch=master)](https://travis-ci.org/fission-suite/get-ipfs)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://github.com/fission-suite/blob/master/LICENSE)
[![Maintainability](https://api.codeclimate.com/v1/badges/8de358f51066211e246c/maintainability)](https://codeclimate.com/github/fission-suite/get-ipfs/maintainability)
[![Built by FISSION](https://img.shields.io/badge/⌘-Built_by_FISSION-purple.svg)](https://fission.codes)
[![Discord](https://img.shields.io/discord/478735028319158273.svg)](https://discord.gg/zAQBDEq)
[![Discourse](https://img.shields.io/discourse/https/talk.fission.codes/topics)](https://talk.fission.codes)

Utility to get js-ipfs with fallbacks

## To Use
```
import getIpfs from 'get-ipfs'

const ipfs = await getIpfs([config])
```

### Config 
```
{
  // `permissions` are enabled if the browser is ipfs-capable (Opera or extension)
  // passed to `window.ipfs.enable`
  // prevents a permission dialog from appearing for every action
  permissions: ['id', 'version', 'add', 'cat', 'dag'],

  // `bootstrap` is a list of peers to be added to the node's bootstrap list
  // to work with the `js-ipfs` fallback, these must have available websocket ports
  bootstrap: []
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
