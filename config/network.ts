import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();

export interface CidrBlock {
  displayName: string;
  cidrBlock: string;
}

/**
 * IP CIDR block for the subnetwork. This must be at least /22 and cannot overlap with any other IP CIDR ranges.
 * @default '10.0.96.0/22'
 */
export const kubernetesNetworkIpv4Cidr =
  config.get('kubernetesNetworkIpv4Cidr') || '10.0.96.0/22';

/**
 * IP CIDR block for pods. This must be at least /22 and cannot overlap with any other IP CIDR ranges.
 * @default '10.0.92.0/22'
 */
export const kubernetesPodsIpv4Cidr =
  config.get('kubernetesPodsIpv4Cidr') || '10.0.92.0/22';

/**
 * IP CIDR block for services. This must be at least /22 and cannot overlap with any other IP CIDR ranges.
 * @default '10.0.88.0/22'
 */
export const kubernetesServicesIpv4Cidr =
  config.get('kubernetesServicesIpv4Cidr') || '10.0.88.0/22';

/**
 * IP CIDR block for the Kubernetes master nodes. This must be exactly /28 and cannot overlap with any other IP CIDR ranges.
 * @default '10.0.82.0/28'
 */
export const kubernetesMastersIpv4Cidr =
  config.get('kubernetesMastersIpv4Cidr') || '10.0.82.0/28';

/**
 * IP CIDR block for the Kubernetes master nodes. This must be exactly /28 and cannot overlap with any other IP CIDR ranges.
 * @default
 * [
 *   {
 *     displayName: 'Anyone',
 *     cidrBlock: '0.0.0.0/0'
 *   }
 * ]
 */
export const kubernetesMasterAuthorizedNetworks = config.getObject<CidrBlock[]>(
  'kubernetesMastersIpv4Cidr'
) || [
  {
    displayName: 'Anyone',
    cidrBlock: '0.0.0.0/0',
  },
];
