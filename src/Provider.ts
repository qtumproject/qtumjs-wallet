export interface IProvider<T> {
  rawCall: (
    method: "sendToContract" | "callContract",
    params: any[],
    opts?: any) => Promise<T>

  cancelTokenSource: () => any
}
