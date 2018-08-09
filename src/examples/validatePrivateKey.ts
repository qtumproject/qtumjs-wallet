import { validatePrivateKey } from "../index"

async function main() {
  const privateKey = "cNQKccYYQyGX9G9Qxq2DJev9jHygbZpb2UG7EvUapbtDx5XhkhYE"
  const isValid = validatePrivateKey(privateKey)
  console.log("isValid: ", isValid)
}

main().catch((err) => console.log(err))

/*
OUTPUT:

isValid: true
*/
