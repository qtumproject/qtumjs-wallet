declare module "qtumd-rpc" {
    export interface IConfig {
        protocol?: string
        user?: string
        pass?: string
        host?: string
        port?: string
    }
    type ICallback = (err: Error | undefined, ret?: any) => void
    export default class RpcClient {
        constructor(config?: IConfig)
        public generate(nblocks: number, callback: ICallback): void
    }
}
