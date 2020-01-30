[pulumi-vault-on-gke - v0.0.1](../../README.md) › [Config](../README.md) › ["config"](_config_.md)

# Config module: "config"

### Variables

* [project](_config_.md#const-project)
* [region](_config_.md#const-region)

## Variables

### `Const` project

• **project**: *string* = configGCP.get('project') || ''

Defined in config.ts:17

The basis for creating, enabling, and using all Google Cloud services.

**`default`** ''

___

### `Const` region

• **region**: *string* = configGCP.get('project') || 'us-east1'

Defined in config.ts:23

Specific geographical location where resources are hosted.

**`default`** 'us-east1'
