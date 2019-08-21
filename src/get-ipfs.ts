// import IPFS from 'typestub-ipfs'
import ipfs from './@types'

export type config = {
  permissions?: string[]
  bootstrap?: string[]
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
  create?: (options: ipfs.Options) => Promise<ipfs>
}

let ipfsInstance: ipfs | null = null

const DEFAULT_PERMISSIONS = ['id', 'version', 'add', 'cat', 'dag']
const normalizePermissions = (permissions = DEFAULT_PERMISSIONS) => {
  if (permissions.indexOf('id') < 0) {
    permissions.push('id')
  }
  if (permissions.indexOf('version') < 0) {
    permissions.push('version')
  }
  return permissions
}

const addBootstrapPeers = async (ipfs: ipfs, peers?: string[]) => {
  if (peers && peers.length > 0) {
    const isOnline = ipfs.isOnline()
    if (isOnline) {
      await ipfs.stop()
    }
    await Promise.all(peers.map(p => ipfs.bootstrap.add(p)))
    await ipfs.start()
  }
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
      await addBootstrapPeers(ipfs, config.bootstrap)
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
  const ipfs = await ipfsPkg.create({ start: false })
  await addBootstrapPeers(ipfs, config.bootstrap)
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

  ipfsInstance = await loadWindowIpfs(config)
  if (ipfsInstance) {
    console.log('window.ipfs is available!')
  } else {
    console.log('window.ipfs is not available, downloading from CDN...')
    ipfsInstance = await loadJsIpfs(config)
  }

  if (!ipfsInstance) {
    throw new Error('Could not load IPFS')
  }

  return ipfsInstance
}

export default getIpfs
