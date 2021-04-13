This is a typescript/nodejs based firebase cloud functions project. This source code is a part of another live project and all private info have been changed in this repo.

It follows TDD using jest for cloud functions. The `src/modules` directory consists of exported functions that take in environment and adminInstance(firestore export) as params and this allows us to test the function in test environment and deploy the same in prod.
