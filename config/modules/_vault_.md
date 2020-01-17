[pulumi-vault-on-gke - v0.0.1](../../README.md) › [Config](../README.md) › ["vault"](_vault_.md)

# Config module: "vault"

### Variables

* [numVaultPods](_vault_.md#const-numvaultpods)
* [vaultContainer](_vault_.md#const-vaultcontainer)
* [vaultInitContainer](_vault_.md#const-vaultinitcontainer)
* [vaultRecoveryKeys](_vault_.md#const-vaultrecoverykeys)
* [vaultRecoveryThreshold](_vault_.md#const-vaultrecoverythreshold)

## Variables

### `Const` numVaultPods

• **numVaultPods**: *number* = config.getNumber('numVaultPods') || 3

Defined in vault.ts:10

Number of Vault pods to run. Anti-affinity rules spread pods across
available nodes. Please use an odd number for better availability.

**`default`** 3

___

### `Const` vaultContainer

• **vaultContainer**: *string* = config.get('vaultContainer') || 'vault:1.2.1'

Defined in vault.ts:17

Name of the Vault container image to deploy. This can be specified like
`container:version` or as a full container URL.

**`default`** 'vault:1.2.1'

___

### `Const` vaultInitContainer

• **vaultInitContainer**: *string* = config.get('vaultInitContainer') || 'sethvargo/vault-init:1.0.0'

Defined in vault.ts:24

Name of the Vault init container image to deploy. This can be specified like
`container:version` or as a full container URL.

**`default`** 'sethvargo/vault-init:1.0.0'

___

### `Const` vaultRecoveryKeys

• **vaultRecoveryKeys**: *string* = config.get('vaultRecoveryKeys') || '1'

Defined in vault.ts:31

Number of recovery keys to generate.

**`default`** '1'

___

### `Const` vaultRecoveryThreshold

• **vaultRecoveryThreshold**: *string* = config.get('vaultRecoveryThreshold') || '1'

Defined in vault.ts:38

Number of recovery keys required for quorum. This must be less than
or equal to `vaultRecoveryKeys`.

**`default`** '1'
