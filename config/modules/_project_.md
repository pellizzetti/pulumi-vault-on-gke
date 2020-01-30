[pulumi-vault-on-gke - v0.0.2](../../README.md) › [Config](../README.md) › ["project"](_project_.md)

# Config module: "project"

### Variables

* [projectServices](_project_.md#const-projectservices)

## Variables

### `Const` projectServices

• **projectServices**: *string[]* = config.getObject<string[]>(
  'projectServices'
) || [
  'cloudkms.googleapis.com',
  'cloudresourcemanager.googleapis.com',
  'container.googleapis.com',
  'compute.googleapis.com',
  'iam.googleapis.com',
  'logging.googleapis.com',
  'monitoring.googleapis.com',
]

Defined in project.ts:19

List of services to enable on the project.

**`default`** 
[
  'cloudkms.googleapis.com',
  'cloudresourcemanager.googleapis.com',
  'container.googleapis.com',
  'compute.googleapis.com',
  'iam.googleapis.com',
  'logging.googleapis.com',
  'monitoring.googleapis.com',
]
