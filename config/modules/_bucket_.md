[pulumi-vault-on-gke - v0.0.2](../../README.md) › [Config](../README.md) › ["bucket"](_bucket_.md)

# Config module: "bucket"

### Variables

* [storageBucketRegion](_bucket_.md#const-storagebucketregion)
* [storageBucketRoles](_bucket_.md#const-storagebucketroles)

## Variables

### `Const` storageBucketRegion

• **storageBucketRegion**: *string* = config.get('storageBucketRoles') || 'US'

Defined in bucket.ts:10

The [GCS location](https://cloud.google.com/storage/docs/bucket-locations).

**`default`** 'US'

___

### `Const` storageBucketRoles

• **storageBucketRoles**: *string[]* = config.getObject<string[]>(
  'storageBucketRoles'
) || ['roles/storage.legacyBucketReader', 'roles/storage.objectAdmin']

Defined in bucket.ts:20

List of storage bucket roles.

**`default`** 
[
  'roles/storage.legacyBucketReader',
  'roles/storage.objectAdmin',
]
