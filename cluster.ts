import * as gcp from '@pulumi/gcp';
import * as k8s from '@pulumi/kubernetes';
import * as pulumi from '@pulumi/pulumi';

import { CidrBlock } from './config/network';

interface ClusterArgs {
  location: string;
  serviceAccountIamRoles: gcp.projects.IAMMember[];
  serviceAccountCustomIamRoles: gcp.projects.IAMMember[];
  projectServices: gcp.projects.Service[];
  bucketIamRoles: gcp.storage.BucketIAMMember[];
  vpc: gcp.compute.Network;
  subnet: gcp.compute.Subnetwork;
  serviceAccount: gcp.serviceAccount.Account;
  cryptoKeyIamRole: gcp.kms.CryptoKeyIAMMember;
  routerNat: gcp.compute.RouterNat;
  k8sSecret: gcp.kms.CryptoKey;
  k8sSecretGke: gcp.kms.CryptoKeyIAMMember;
  loadBalancerIp: gcp.compute.Address;
  kubernetesMastersIpv4Cidr: string;
  kubernetesMasterAuthorizedNetworks: CidrBlock[];
  kubernetesNodesPerZone: number;
  kubernetesInstanceType: string;
  kubernetesDailyMaintenanceWindow: string;
  kubernetesLoggingService: string;
  kubernetesMonitoringService: string;
  kubernetesSecretsCryptoKey: string;
}

/**
 * Create Vault cluster.
 */
export default function createCluster(
  args: ClusterArgs
): {
  k8sConfig: pulumi.Output<string>;
  provider: k8s.Provider;
} {
  const cluster = new gcp.container.Cluster(
    'vault-cluster',
    {
      location: args.location,
      network: args.vpc.selfLink,
      subnetwork: args.subnet.selfLink,
      initialNodeCount: args.kubernetesNodesPerZone,
      minMasterVersion: gcp.container.getEngineVersions({
        location: args.location,
      }).latestMasterVersion,
      nodeVersion: gcp.container.getEngineVersions({ location: args.location })
        .latestMasterVersion,
      loggingService: args.kubernetesLoggingService,
      monitoringService: args.kubernetesMonitoringService,
      enableLegacyAbac: false,
      databaseEncryption: {
        state: 'ENCRYPTED',
        keyName: args.k8sSecret.selfLink,
      },
      nodeConfig: {
        machineType: args.kubernetesInstanceType,
        serviceAccount: args.serviceAccount.email,
        oauthScopes: ['https://www.googleapis.com/auth/cloud-platform'],
        metadata: {
          'google-compute-enable-virtio-rng': 'true',
          'disable-legacy-endpoints': 'true',
        },
        labels: {
          service: 'vault',
        },
        tags: ['vault'],
        workloadMetadataConfig: {
          nodeMetadata: 'SECURE',
        },
      },
      addonsConfig: {
        networkPolicyConfig: {
          disabled: false,
        },
      },
      masterAuth: {
        username: '',
        password: '',
        clientCertificateConfig: {
          issueClientCertificate: false,
        },
      },
      networkPolicy: {
        enabled: true,
      },
      maintenancePolicy: {
        dailyMaintenanceWindow: {
          startTime: args.kubernetesDailyMaintenanceWindow,
        },
      },
      ipAllocationPolicy: {
        clusterSecondaryRangeName: args.subnet.secondaryIpRanges[0].rangeName,
        servicesSecondaryRangeName: args.subnet.secondaryIpRanges[1].rangeName,
      },
      masterAuthorizedNetworksConfig: {
        cidrBlocks: args.kubernetesMasterAuthorizedNetworks,
      },
      privateClusterConfig: {
        enablePrivateEndpoint: false,
        enablePrivateNodes: true,
        masterIpv4CidrBlock: args.kubernetesMastersIpv4Cidr,
      },
    },
    {
      dependsOn: [
        ...args.serviceAccountIamRoles,
        ...args.serviceAccountCustomIamRoles,
        ...args.projectServices,
        ...args.bucketIamRoles,
        args.cryptoKeyIamRole,
        args.k8sSecretGke,
        args.routerNat,
      ],
    }
  );

  /**
   * Manufacture a GKE-style Kubeconfig. Note that this is slightly
   * "different" because of the way GKE requires gcloud to be in the
   * picture for cluster authentication (rather than using the client
   * cert/key directly).
   */
  const k8sConfig = pulumi
    .all([cluster.name, cluster.endpoint, cluster.masterAuth])
    .apply(([name, endpoint, auth]) => {
      const context = `${gcp.config.project}_${gcp.config.zone}_${name}`;
      return `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${auth.clusterCaCertificate}
    server: https://${endpoint}
  name: ${context}
contexts:
- context:
    cluster: ${context}
    user: ${context}
  name: ${context}
current-context: ${context}
kind: Config
preferences: {}
users:
- name: ${context}
  user:
    auth-provider:
      config:
        cmd-args: config config-helper --format=json
        cmd-path: gcloud
        expiry-key: '{.credential.token_expiry}'
        token-key: '{.credential.access_token}'
      name: gcp
`;
    });

  const provider = new k8s.Provider('vault-cluster-provider', {
    kubeconfig: k8sConfig,
  });

  return { k8sConfig, provider };
}
