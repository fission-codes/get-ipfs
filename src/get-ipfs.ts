import ipfs from './@types'


// Types
// -----

export type config = {
  permissions?: string[]
  peers?: string[]
  browserPeers?: string[]
  localPeers?: string[]
  jsIpfs?: string | (() => Promise<IpfsPkg>)
}

type IpfsWindow = {
  ipfs?: IpfsPkg
  Ipfs?: IpfsPkg
}

type EnableOptions = {
  commands?: string[]
}

interface IpfsPkg extends ipfs {
  enable?: (options: EnableOptions) => Promise<ipfs>
  create?: (options?: ipfs.Options) => Promise<ipfs>
}



// Context
// -------

const UNPKG_URL = 'https://unpkg.com/ipfs@latest/dist/index.min.js'
let ipfsInstance: ipfs | null = null



// Permissions
// -----------

const DEFAULT_PERMISSIONS = ['id', 'version', 'add', 'cat', 'dag', 'swarm']

const normalizePermissions = (permissions = DEFAULT_PERMISSIONS) => {
  if (permissions.indexOf('id') < 0) permissions.push('id')
  if (permissions.indexOf('version') < 0) permissions.push('version')
  return permissions
}



// Default
// =======

const getIpfs = async (config: config = {}) => {
  if (ipfsInstance) return ipfsInstance

  // If not set up before, start flow.
  let peers = config.peers || []
  ipfsInstance = await loadWindowIpfs(config)

  if (ipfsInstance) {
    console.log('window.ipfs is available!')
    peers = peers.concat(config.localPeers || [])

  } else {
    console.log('window.ipfs is not available, loading js-ipfs...')
    ipfsInstance = await loadJsIpfs(config)
    peers = peers.concat(config.browserPeers || [])

  }

  if (!ipfsInstance) {
    throw new Error('Could not load IPFS')
  }

  await connectPeers({ ipfs: ipfsInstance, peers: peers, remainingTries: 2})
  return ipfsInstance
}


export default getIpfs



// 🛠


export async function connectPeers({
  ipfs: ipfs,
  peers: string[],
  remainingTries?: number = 0,
  timeout?: number = 0
}): Promise<ipfs> {
  if (remainingTries < 1) {
    console.log('Could not connect to any of the requested peers')
    return ipfs
  }

  let connected = await _connectPeers(ipfs, peers)

  if (connected.length > 0) {
    console.log(`Connected to: ${connected.join(', ')}`)
  } else {
    await waitThenDo(timeout, async () => {
      await connectPeers({ ipfs, peers, remainingTries: remainingTries - 1, timeout })
    })
  }

  return ipfs
}


export async function ipfsIsWorking(ipfs?: ipfs): Promise<boolean> {
  if (!ipfs) return false

  try {
    const id = await ipfs.id()
    return !!(id.id && id.agentVersion)
  } catch (err) {
    return false
  }
}


export async function loadJsIpfs(config: config): Promise<ipfs | null> {
  const ipfsPkg = await (() => { switch (typeof config.jsIpfs) {
    case 'function':  return config.jsIpfs()
    case 'string':    return loadJsIpfsThroughScript(config.jsIpfs)
    default:          return loadJsIpfsThroughScript(UNPKG_URL)
  }})()

  if (!ipfsPkg?.create) return null
  const ipfs = await ipfsPkg.create({ config: { Addresses: { Swarm: [] }}})
  return await ipfsIsWorking(ipfs) ? ipfs : null
}


export async function loadWindowIpfs(config: config): Promise<ipfs | null> {
  let ipfs = (window as IpfsWindow).ipfs
  if (!ipfs) return null

  if (ipfs.enable) {
    const permissions = normalizePermissions(config.permissions)
    ipfs = await ipfs.enable({ commands: permissions })
  }

  return await ipfsIsWorking(ipfs)
    ? ipfs as ipfs
    : null
}



// ㊙️


async function _connectPeers(ipfs: ipfs, peers: string[] = []): Promise<string[]> {
  const connectedPeers = await Promise.all(peers.map(async p => {
    try {
      await ipfs.swarm.connect(p)
      return p
    } catch (err) {
      console.log('Could not connect to peer:', p)
      console.error(err)
      return null
    }

  })).then(list => list.filter(
    a => !!a
  )) as string[]

  return connectedPeers
}


async function loadJsIpfsThroughScript(url: string): Promise<IpfsPkg | undefined> {
  try {
    await loadScript(url)
  } catch (err) {
    return undefined
  }

  return (window as IpfsWindow).Ipfs
}


function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = async () => resolve()
    script.onerror = reject
    document.body.appendChild(script)
  })
}


async function waitThenDo(timeout: number, fn: () => Promise<void>) {
  return new Promise(async (resolve) => {
    setTimeout(fn, timeout)
    resolve()
  })
}
