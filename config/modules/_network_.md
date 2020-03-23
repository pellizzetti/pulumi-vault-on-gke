[pulumi-vault-on-gke - v0.0.4](../../README.md) › [Config](../README.md) › ["network"](_network_.md)

# Config module: "network"

### Interfaces

* [CidrBlock](../interfaces/_network_.cidrblock.md)

### Variables

* [kubernetesMasterAuthorizedNetworks](_network_.md#const-kubernetesmasterauthorizednetworks)
* [kubernetesMastersIpv4Cidr](_network_.md#const-kubernetesmastersipv4cidr)
* [kubernetesNetworkIpv4Cidr](_network_.md#const-kubernetesnetworkipv4cidr)
* [kubernetesPodsIpv4Cidr](_network_.md#const-kubernetespodsipv4cidr)
* [kubernetesServicesIpv4Cidr](_network_.md#const-kubernetesservicesipv4cidr)
* [vaultSourceRanges](_network_.md#const-vaultSourceRanges)

## Variables

### `Const` kubernetesMasterAuthorizedNetworks

• **kubernetesMasterAuthorizedNetworks**: *[CidrBlock](../interfaces/_network_.cidrblock.md)[]* = config.getObject<CidrBlock[]>(
  'kubernetesMastersIpv4Cidr'
) || [
  {
    displayName: 'Anyone',
    cidrBlock: '0.0.0.0/0',
  },
]

Defined in network.ts:48

IP CIDR block for the Kubernetes master nodes. This must be exactly /28 and cannot overlap with any other IP CIDR ranges.

**`default`** 
[
  {
    displayName: 'Anyone',
    cidrBlock: '0.0.0.0/0'
  }
]

___

### `Const` kubernetesMastersIpv4Cidr

• **kubernetesMastersIpv4Cidr**: *string* = config.get('kubernetesMastersIpv4Cidr') || '10.0.82.0/28'

Defined in network.ts:35

IP CIDR block for the Kubernetes master nodes. This must be exactly /28 and cannot overlap with any other IP CIDR ranges.

**`default`** '10.0.82.0/28'

___

### `Const` kubernetesNetworkIpv4Cidr

• **kubernetesNetworkIpv4Cidr**: *string* = config.get('kubernetesNetworkIpv4Cidr') || '10.0.96.0/22'

Defined in network.ts:14

IP CIDR block for the subnetwork. This must be at least /22 and cannot overlap with any other IP CIDR ranges.

**`default`** '10.0.96.0/22'

___

### `Const` kubernetesPodsIpv4Cidr

• **kubernetesPodsIpv4Cidr**: *string* = config.get('kubernetesPodsIpv4Cidr') || '10.0.92.0/22'

Defined in network.ts:21

IP CIDR block for pods. This must be at least /22 and cannot overlap with any other IP CIDR ranges.

**`default`** '10.0.92.0/22'

___

### `Const` kubernetesServicesIpv4Cidr

• **kubernetesServicesIpv4Cidr**: *string* = config.get('kubernetesServicesIpv4Cidr') || '10.0.88.0/22'

Defined in network.ts:28

IP CIDR block for services. This must be at least /22 and cannot overlap with any other IP CIDR ranges.

**`default`** '10.0.88.0/22'

___

### `Const` vaultSourceRanges

• **vaultSourceRanges**: *string[]* = config.getObject<string[]>(
  'vaultSourceRanges'
) || ['0.0.0.0/0'];

Defined in network.ts:67

List of addresses or CIDR blocks which are allowed to connect to the Vault. The default behavior is to allow anyone (0.0.0.0/0) access. You should restrict access to external IPs that need to access the Vault cluster.

**`default`**
[
  '0.0.0.0/0'
]
