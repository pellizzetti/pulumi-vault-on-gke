import * as gcp from '@pulumi/gcp';

interface VaultNetworkArgs {
  region: string;
  projectServices: gcp.projects.Service[];
  kubernetesNetworkIpv4Cidr: string;
  kubernetesPodsIpv4Cidr: string;
  kubernetesServicesIpv4Cidr: string;
}

/**
 * Create an external NAT IP, network, subnets, NAT router and LB IP.
 */
export default function createNetwork(
  args: VaultNetworkArgs
): {
  vpc: gcp.compute.Network;
  subnet: gcp.compute.Subnetwork;
  routerNat: gcp.compute.RouterNat;
  loadBalancerIp: gcp.compute.Address;
} {
  const natIps = [
    new gcp.compute.Address(
      'vault-nat-ip-1',
      {
        name: 'vault-nat-ip-1',
        region: args.region,
      },
      { dependsOn: args.projectServices }
    ).selfLink,

    new gcp.compute.Address(
      'vault-nat-ip-2',
      {
        name: 'vault-nat-ip-2',
        region: args.region,
      },
      { dependsOn: args.projectServices }
    ).selfLink,
  ];

  const vpc = new gcp.compute.Network(
    'vault-network',
    {
      name: 'vault-network',
      autoCreateSubnetworks: false,
    },
    { dependsOn: args.projectServices }
  );

  const subnet = new gcp.compute.Subnetwork('vault-network', {
    name: 'vault-network',
    network: vpc.selfLink,
    ipCidrRange: args.kubernetesNetworkIpv4Cidr,
    privateIpGoogleAccess: true,
    secondaryIpRanges: [
      {
        ipCidrRange: args.kubernetesPodsIpv4Cidr,
        rangeName: 'vault-pods',
      },
      {
        ipCidrRange: args.kubernetesServicesIpv4Cidr,
        rangeName: 'vault-svcs',
      },
    ],
  });

  const router = new gcp.compute.Router('vault-router', {
    name: 'vault-router',
    region: args.region,
    network: vpc.selfLink,

    bgp: {
      asn: 64614,
    },
  });

  const routerNat = new gcp.compute.RouterNat('vault-nat', {
    name: 'vault-nat',
    router: router.name,
    region: args.region,
    natIpAllocateOption: 'MANUAL_ONLY',
    natIps,
    sourceSubnetworkIpRangesToNat: 'LIST_OF_SUBNETWORKS',
    subnetworks: [
      {
        name: subnet.selfLink,
        sourceIpRangesToNats: [
          'PRIMARY_IP_RANGE',
          'LIST_OF_SECONDARY_IP_RANGES',
        ],
        secondaryIpRangeNames: [
          subnet.secondaryIpRanges[0].rangeName,
          subnet.secondaryIpRanges[1].rangeName,
        ],
      },
    ],
  });

  const loadBalancerIp = new gcp.compute.Address(
    'vault-lb-ip',
    {
      name: 'vault-lb-ip',
      region: args.region,
    },
    { dependsOn: args.projectServices, additionalSecretOutputs: ['address'] }
  );

  return { vpc, subnet, routerNat, loadBalancerIp };
}
