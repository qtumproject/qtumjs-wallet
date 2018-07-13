export interface IProvider {
  rawCall: (
    method: "sendToContract" | "callContract",
    params: any[],
    opts?: any) => Promise<any>

  cancelTokenSource: () => any
}
