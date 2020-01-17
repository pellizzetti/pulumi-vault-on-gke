[pulumi-vault-on-gke - v0.0.1](../../README.md) › [Config](../README.md) › ["k8s"](_k8s_.md)

# Config module: "k8s"

### Variables

* [kubernetesDailyMaintenanceWindow](_k8s_.md#const-kubernetesdailymaintenancewindow)
* [kubernetesInstanceType](_k8s_.md#const-kubernetesinstancetype)
* [kubernetesLoggingService](_k8s_.md#const-kubernetesloggingservice)
* [kubernetesMonitoringService](_k8s_.md#const-kubernetesmonitoringservice)
* [kubernetesNodesPerZone](_k8s_.md#const-kubernetesnodesperzone)
* [kubernetesSecretsCryptoKey](_k8s_.md#const-kubernetessecretscryptokey)

## Variables

### `Const` kubernetesDailyMaintenanceWindow

• **kubernetesDailyMaintenanceWindow**: *string* = config.get('kubernetesDailyMaintenanceWindow') || '06:00'

Defined in k8s.ts:26

Maintenance window for GKE.

**`default`** '06:00'

___

### `Const` kubernetesInstanceType

• **kubernetesInstanceType**: *string* = config.get('kubernetesInstanceType') || 'n1-standard-2'

Defined in k8s.ts:19

Instance type to use for the nodes.

**`default`** 'n1-standard-2'

___

### `Const` kubernetesLoggingService

• **kubernetesLoggingService**: *string* = config.get('kubernetesLoggingService') || 'logging.googleapis.com/kubernetes'

Defined in k8s.ts:34

Name of the logging service to use. By default this uses
the new Stackdriver GKE beta.

**`default`** 'logging.googleapis.com/kubernetes'

___

### `Const` kubernetesMonitoringService

• **kubernetesMonitoringService**: *string* = config.get('kubernetesMonitoringService') ||
  'monitoring.googleapis.com/kubernetes'

Defined in k8s.ts:42

Name of the monitoring service to use. By default this uses
the new Stackdriver GKE beta.

**`default`** 'monitoring.googleapis.com/kubernetes'

___

### `Const` kubernetesNodesPerZone

• **kubernetesNodesPerZone**: *number* = config.getNumber('kubernetesNodesPerZone') || 1

Defined in k8s.ts:12

Number of nodes to deploy in each zone of the Kubernetes cluster.
For example, if there are 4 zones in the region and numNodesPerZone is 2,
8 total nodes will be created.

**`default`** 1

___

### `Const` kubernetesSecretsCryptoKey

• **kubernetesSecretsCryptoKey**: *string* = config.get('kubernetesSecretsCryptoKey') || 'kubernetes-secrets'

Defined in k8s.ts:50

Name of the KMS key to use for encrypting the Kubernetes database.

**`default`** 'kubernetes-secrets'
