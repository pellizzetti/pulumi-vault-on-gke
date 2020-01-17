import * as pulumi from '@pulumi/pulumi';

import {
  project,
  region,
  serviceAccountIamRoles,
  serviceAccountCustomIamRoles,
  projectServices,
  storageBucketRegion,
  storageBucketRoles,
  kmsCryptoKey,
  kmsKeyRingPrefix,
  kubernetesNetworkIpv4Cidr,
  kubernetesPodsIpv4Cidr,
  kubernetesServicesIpv4Cidr,
  kubernetesMastersIpv4Cidr,
  kubernetesMasterAuthorizedNetworks,
  kubernetesNodesPerZone,
  kubernetesInstanceType,
  kubernetesDailyMaintenanceWindow,
  kubernetesLoggingService,
  kubernetesMonitoringService,
  kubernetesSecretsCryptoKey,
} from './config';

import createServiceAccount from './serviceAccount';
import enableProjectServices from './project';
import createBucket from './bucket';
import createKMS from './kms';
import createNetwork from './network';
import createCluster from './cluster';
import createTls from './tls';
import deployToCluster from './k8s';

const {
  serviceAccount,
  appliedServiceAccountIamRoles,
  appliedServiceAccountCustomIamRoles,
} = createServiceAccount({
  serviceAccountIamRoles,
  serviceAccountCustomIamRoles,
});

const enabledProjectServices = enableProjectServices({
  projectServices,
});

const { bucket, appliedBucketIamRoles } = createBucket({
  location: storageBucketRegion,
  storageBucketRoles,
  serviceAccount,
  projectServices: enabledProjectServices,
});

const {
  keyRing,
  cryptoKey,
  cryptoKeyIamRole,
  k8sSecret,
  k8sSecretGke,
} = createKMS({
  serviceAccount,
  projectServices: enabledProjectServices,
  kmsCryptoKey,
  kmsKeyRingPrefix,
  project,
  region,
});

const { vpc, subnet, routerNat, loadBalancerIp } = createNetwork({
  projectServices: enabledProjectServices,
  region,
  kubernetesNetworkIpv4Cidr,
  kubernetesPodsIpv4Cidr,
  kubernetesServicesIpv4Cidr,
});

const { k8sConfig, provider } = createCluster({
  location: region,
  serviceAccountIamRoles: appliedServiceAccountIamRoles,
  serviceAccountCustomIamRoles: appliedServiceAccountCustomIamRoles,
  projectServices: enabledProjectServices,
  bucketIamRoles: appliedBucketIamRoles,
  vpc,
  subnet,
  serviceAccount,
  cryptoKeyIamRole,
  routerNat,
  k8sSecret,
  k8sSecretGke,
  loadBalancerIp,
  kubernetesMastersIpv4Cidr,
  kubernetesMasterAuthorizedNetworks,
  kubernetesNodesPerZone,
  kubernetesInstanceType,
  kubernetesDailyMaintenanceWindow,
  kubernetesLoggingService,
  kubernetesMonitoringService,
  kubernetesSecretsCryptoKey,
});

const { selfSignedCa, serverCa, locallySignedCert } = createTls({
  loadBalancerIp,
});

deployToCluster({
  provider,
  selfSignedCa,
  serverCa,
  locallySignedCert,
  loadBalancerIp,
  bucket,
  keyRing,
  cryptoKey,
});

export const kubeconfig = k8sConfig;
export const decryptRootToken = pulumi.interpolate`gsutil cat gs://${bucket.name}/root-token.enc | base64 --decode | gcloud kms decrypt --key ${cryptoKey.selfLink} --ciphertext-file - --plaintext-file - | sed -E "s/%|#$//"`;
export const vaultLoadBalancerIpAddress = loadBalancerIp.address;
export const vaultEnv = pulumi.interpolate`export VAULT_ADDR="https://$(pulumi stack output vaultLoadBalancerIpAddress)";
export VAULT_TOKEN=$(${decryptRootToken});
export VAULT_CAPATH="$(pwd)/vault/tls/vault-ca.pem";
# Run this command to configure your shell:
# eval $(pulumi stack output vaultEnv)`;
