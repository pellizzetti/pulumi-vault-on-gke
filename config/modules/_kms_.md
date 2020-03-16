[pulumi-vault-on-gke - v0.0.3](../../README.md) › [Config](../README.md) › ["kms"](_kms_.md)

# Config module: "kms"

### Variables

* [kmsCryptoKey](_kms_.md#const-kmscryptokey)
* [kmsKeyRingPrefix](_kms_.md#const-kmskeyringprefix)

## Variables

### `Const` kmsCryptoKey

• **kmsCryptoKey**: *string* = config.get('kmsCryptoKey') || 'vault-init'

Defined in kms.ts:15

String value to use for the name of the KMS crypto key.

**`default`** 'vault-init'

___

### `Const` kmsKeyRingPrefix

• **kmsKeyRingPrefix**: *string* = config.get('kmsKeyRingPrefix') || 'vault-'

Defined in kms.ts:9

String value to prefix the generated key ring with.

**`default`** 'vault-'
