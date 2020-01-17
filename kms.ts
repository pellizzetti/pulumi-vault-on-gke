import * as gcp from '@pulumi/gcp';
import * as random from '@pulumi/random';

interface VaultKeyRingArgs {
  serviceAccount: gcp.serviceAccount.Account;
  projectServices: gcp.projects.Service[];
  kmsCryptoKey: string;
  kmsKeyRingPrefix: string;
  project: string;
  region: string;
}

/**
 * Create the KMS key ring, the crypto key for encrypting init keys, grant
 * service account access to the key, create the crypto key for encrypting
 * Kubernetes secrets and grant GKE access to the key.
 */
export default function createKMS(
  args: VaultKeyRingArgs
): {
  keyRing: gcp.kms.KeyRing;
  cryptoKey: gcp.kms.CryptoKey;
  cryptoKeyIamRole: gcp.kms.CryptoKeyIAMMember;
  k8sSecret: gcp.kms.CryptoKey;
  k8sSecretGke: gcp.kms.CryptoKeyIAMMember;
} {
  const vaultKmsId = new random.RandomId('random-kms-id', {
    prefix: 'vault-',
    byteLength: 8,
  }).hex;

  const keyRing = new gcp.kms.KeyRing(
    'vault',
    { name: vaultKmsId, location: args.region },
    { dependsOn: args.projectServices }
  );

  const cryptoKey = new gcp.kms.CryptoKey('vault-init', {
    name: args.kmsCryptoKey,
    keyRing: keyRing.id,
    rotationPeriod: '604800s',
  });

  const cryptoKeyIamRole = new gcp.kms.CryptoKeyIAMMember('vault-init', {
    cryptoKeyId: cryptoKey.id,
    role: 'roles/cloudkms.cryptoKeyEncrypterDecrypter',
    member: args.serviceAccount.email.apply(email => `serviceAccount:${email}`),
  });

  const k8sSecret = new gcp.kms.CryptoKey('vault-kubernetes-secrets', {
    name: 'kubernetes-secrets',
    keyRing: keyRing.id,
    rotationPeriod: '604800s',
  });

  const projectNumber = gcp.organizations.getProject({
    projectId: args.project,
  }).number;

  const k8sSecretGke = new gcp.kms.CryptoKeyIAMMember(
    'vault-kubernetes-secrets-gke',
    {
      cryptoKeyId: k8sSecret.id,
      role: 'roles/cloudkms.cryptoKeyEncrypterDecrypter',
      member: `serviceAccount:service-${projectNumber}@container-engine-robot.iam.gserviceaccount.com`,
    },
    { dependsOn: args.serviceAccount }
  );

  return {
    keyRing,
    cryptoKey,
    cryptoKeyIamRole,
    k8sSecret,
    k8sSecretGke,
  };
}
