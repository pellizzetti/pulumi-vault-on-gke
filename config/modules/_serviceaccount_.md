[pulumi-vault-on-gke - v0.0.1](../../README.md) › [Config](../README.md) › ["serviceAccount"](_serviceaccount_.md)

# Config module: "serviceAccount"

### Variables

* [serviceAccountCustomIamRoles](_serviceaccount_.md#const-serviceaccountcustomiamroles)
* [serviceAccountIamRoles](_serviceaccount_.md#const-serviceaccountiamroles)

## Variables

### `Const` serviceAccountCustomIamRoles

• **serviceAccountCustomIamRoles**: *string[]* = config.getObject<string[]>('serviceAccountCustomIamRoles') || []

Defined in serviceAccount.ts:27

List of arbitrary additional IAM roles to attach to the service account
on the Vault nodes.

**`default`** []

___

### `Const` serviceAccountIamRoles

• **serviceAccountIamRoles**: *string[]* = config.getObject<string[]>(
  'serviceAccountIamRoles'
) || [
  'roles/logging.logWriter',
  'roles/monitoring.metricWriter',
  'roles/monitoring.viewer',
]

Defined in serviceAccount.ts:14

List of IAM roles to assign to the service account.

**`default`** 
[
  'roles/logging.logWriter',
  'roles/monitoring.metricWriter',
  'roles/monitoring.viewer',
]
