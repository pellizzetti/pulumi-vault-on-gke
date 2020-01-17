import * as gcp from '@pulumi/gcp';
import * as tls from '@pulumi/tls';

import * as provisioner from './provisioners';

interface TlsArgs {
  loadBalancerIp: gcp.compute.Address;
}

/**
 * Generate self-signed TLS certificates.
 */
export default function createTls(
  args: TlsArgs
): {
  selfSignedCa: tls.SelfSignedCert;
  serverCa: tls.PrivateKey;
  locallySignedCert: tls.LocallySignedCert;
} {
  const ca = new tls.PrivateKey(
    'vault-ca',
    {
      algorithm: 'RSA',
      ecdsaCurve: '2048',
    },
    {
      additionalSecretOutputs: ['privateKeyPem'],
    }
  );

  const selfSignedCa = new tls.SelfSignedCert('vault-ca', {
    keyAlgorithm: ca.algorithm,
    privateKeyPem: ca.privateKeyPem,
    subjects: [
      {
        commonName: 'vault-ca.local',
        organization: 'HashiCorp Vault',
      },
    ],
    validityPeriodHours: 8760,
    isCaCertificate: true,
    allowedUses: ['cert_signing', 'digital_signature', 'key_encipherment'],
  });

  ((): provisioner.SaveToFile =>
    new provisioner.SaveToFile(
      'vault-ca-stf',
      {
        path: './vault/tls/vault-ca.pem',
        content: selfSignedCa.certPem,
        permission: '0600',
      },
      { dependsOn: selfSignedCa }
    ))();

  const serverCa = new tls.PrivateKey(
    'vault-server',
    {
      algorithm: 'RSA',
      ecdsaCurve: '2048',
    },
    {
      additionalSecretOutputs: ['privateKeyPem'],
    }
  );

  const certRequest = new tls.CertRequest('vault', {
    keyAlgorithm: serverCa.algorithm,
    privateKeyPem: serverCa.privateKeyPem,
    subjects: [
      {
        commonName: 'vault.local',
        organization: 'HashiCorp Vault',
      },
    ],
    dnsNames: ['vault', 'vault.local', 'vault.default.svc.cluster.local'],
    ipAddresses: [args.loadBalancerIp.address],
  });

  const locallySignedCert = new tls.LocallySignedCert('vault', {
    certRequestPem: certRequest.certRequestPem,
    caKeyAlgorithm: ca.algorithm,
    caPrivateKeyPem: ca.privateKeyPem,
    caCertPem: selfSignedCa.certPem,

    validityPeriodHours: 8760,

    allowedUses: [
      'cert_signing',
      'client_auth',
      'digital_signature',
      'key_encipherment',
      'server_auth',
    ],
  });

  ((): provisioner.SaveToFile =>
    new provisioner.SaveToFile(
      'vault-signed-cert-stf',
      {
        path: './vault/tls/vault.pem',
        content: locallySignedCert.certPem,
      },
      { dependsOn: locallySignedCert }
    ))();

  ((): provisioner.SaveToFile =>
    new provisioner.SaveToFile(
      'vault-self-signed-ca-stf',
      {
        path: './vault/tls/vault.pem',
        content: selfSignedCa.certPem,
        append: true,
        permission: '0600',
      },
      { dependsOn: locallySignedCert }
    ))();

  return { selfSignedCa, serverCa, locallySignedCert };
}
