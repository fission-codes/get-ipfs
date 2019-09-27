import ipfs from './@types'

export type config = {
  permissions?: string[]
  peers?: string[]
  browserPeers?: string[]
  localPeers?: string[]
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

let ipfsInstance: ipfs | null = null

const DEFAULT_PERMISSIONS = ['id', 'version', 'add', 'cat', 'dag', 'swarm']
const normalizePermissions = (permissions = DEFAULT_PERMISSIONS) => {
  if (permissions.indexOf('id') < 0) {
    permissions.push('id')
  }
  if (permissions.indexOf('version') < 0) {
    permissions.push('version')
  }
  return permissions
}

const connectPeers = async (ipfs: ipfs, peers: string[] = []) => {
  await Promise.all(
    peers.map(async p => {
      try {
        await ipfs.swarm.connect(p)
      } catch (err) {
        console.log('Could not connect to peer: ', p)
      }
    })
  )
  return ipfs
}

export const ipfsIsWorking = async (ipfs?: ipfs) => {
  if (!ipfs) {
    return false
  }
  try {
    const id = await ipfs.id()
    if (id.id && id.agentVersion) {
      return true
    } else {
      return false
    }
  } catch (err) {
    return false
  }
}

export const loadWindowIpfs = async (config: config): Promise<ipfs | null> => {
  let ipfs = (window as IpfsWindow).ipfs
  if (ipfs) {
    if (ipfs.enable) {
      const permissions = normalizePermissions(config.permissions)
      ipfs = await ipfs.enable({
        commands: permissions
      })
    }
    const isWorking = await ipfsIsWorking(ipfs)
    if (isWorking) {
      return ipfs as ipfs
    } else {
      return null
    }
  }
  return null
}

export const loadIpfsScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/ipfs/dist/index.min.js'
    script.onload = async () => {
      return resolve()
    }
    script.onerror = reject
    document.body.appendChild(script)
  })
}

export const loadJsIpfs = async (config: config): Promise<ipfs | null> => {
  try {
    await loadIpfsScript()
  } catch (err) {
    return null
  }

  const ipfsPkg = (window as IpfsWindow).Ipfs
  if (!ipfsPkg || !ipfsPkg.create) {
    return null
  }
  const ipfs = await ipfsPkg.create()
  const isWorking = await ipfsIsWorking(ipfs)

  if (isWorking) {
    return ipfs
  } else {
    return null
  }
}

const getIpfs = async (config: config = {}): Promise<ipfs> => {
  // if already instantiated
  if (ipfsInstance) {
    return ipfsInstance
  }

  let peers = config.peers || []
  ipfsInstance = await loadWindowIpfs(config)
  if (ipfsInstance) {
    console.log('window.ipfs is available!')
    peers = peers.concat(config.localPeers || [])
  } else {
    console.log('window.ipfs is not available, downloading from CDN...')
    ipfsInstance = await loadJsIpfs(config)
    peers = peers.concat(config.browserPeers || [])
  }

  if (!ipfsInstance) {
    throw new Error('Could not load IPFS')
  }

  await connectPeers(ipfsInstance, peers)
  console.log('connected to: ', peers)

  return ipfsInstance
}

export default getIpfs
