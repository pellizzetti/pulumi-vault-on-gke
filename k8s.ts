import * as gcp from '@pulumi/gcp';
import * as k8s from '@pulumi/kubernetes';
import * as tls from '@pulumi/tls';
import * as pulumi from '@pulumi/pulumi';

function toBase64(s: string): string {
  return Buffer.from(s).toString('base64');
}

interface VaultNetworkArgs {
  provider: k8s.Provider;
  locallySignedCert: tls.LocallySignedCert;
  selfSignedCa: tls.SelfSignedCert;
  serverCa: tls.PrivateKey;
  loadBalancerIp: gcp.compute.Address;
  bucket: gcp.storage.Bucket;
  keyRing: gcp.kms.KeyRing;
  cryptoKey: gcp.kms.CryptoKey;
}

/**
 * Deploy K8s objects to Vault cluster.
 */
export default function deployToCluster(args: VaultNetworkArgs): void {
  ((): k8s.core.v1.Secret =>
    new k8s.core.v1.Secret(
      'vault-tls',
      {
        metadata: {
          name: 'vault-tls',
        },
        data: {
          'vault.crt': pulumi
            .all([args.locallySignedCert.certPem, args.selfSignedCa.certPem])
            .apply(([certPem1, certPem2]) =>
              toBase64(`${certPem1}\n${certPem2}`)
            ),
          'vault.key': args.serverCa.privateKeyPem.apply(privateKeyPem =>
            toBase64(privateKeyPem)
          ),
          'ca.crt': args.selfSignedCa.certPem.apply(certPem =>
            toBase64(certPem)
          ),
        },
      },
      { provider: args.provider }
    ))();

  ((): k8s.core.v1.Service =>
    new k8s.core.v1.Service(
      'vault-lb',
      {
        metadata: {
          name: 'vault',
          labels: {
            app: 'vault',
          },
        },
        spec: {
          type: 'LoadBalancer',
          loadBalancerIP: args.loadBalancerIp.address,
          externalTrafficPolicy: 'Local',
          selector: {
            app: 'vault',
          },
          ports: [
            {
              name: 'vault-port',
              port: 443,
              targetPort: 8200,
              protocol: 'TCP',
            },
          ],
        },
      },
      {
        provider: args.provider,
      }
    ))();

  ((): k8s.apps.v1.StatefulSet =>
    new k8s.apps.v1.StatefulSet(
      'vault',
      {
        metadata: {
          name: 'vault',
          labels: {
            app: 'vault',
          },
        },
        spec: {
          serviceName: 'vault',
          replicas: 3,
          selector: {
            matchLabels: {
              app: 'vault',
            },
          },
          template: {
            metadata: {
              labels: {
                app: 'vault',
              },
            },
            spec: {
              terminationGracePeriodSeconds: 10,
              affinity: {
                podAntiAffinity: {
                  preferredDuringSchedulingIgnoredDuringExecution: [
                    {
                      podAffinityTerm: {
                        topologyKey: 'kubernetes.io/hostname',
                        labelSelector: {
                          matchExpressions: [
                            {
                              key: 'app',
                              operator: 'In',
                              values: ['vault'],
                            },
                          ],
                        },
                      },
                      weight: 50,
                    },
                  ],
                },
              },
              containers: [
                {
                  name: 'vault-init',
                  image: 'sethvargo/vault-init:1.1.0',
                  imagePullPolicy: 'IfNotPresent',
                  resources: {
                    requests: {
                      cpu: '100m',
                      memory: '64Mi',
                    },
                  },
                  env: [
                    {
                      name: 'GCS_BUCKET_NAME',
                      value: args.bucket.name,
                    },
                    {
                      name: 'KMS_KEY_ID',
                      value: args.cryptoKey.selfLink,
                    },
                    {
                      name: 'VAULT_ADDR',
                      value: 'http://127.0.0.1:8200',
                    },
                    {
                      name: 'VAULT_SECRET_SHARES',
                      value: '1',
                    },
                    {
                      name: 'VAULT_SECRET_THRESHOLD',
                      value: '1',
                    },
                  ],
                },
                {
                  name: 'vault',
                  image: 'vault:1.3.1',
                  imagePullPolicy: 'IfNotPresent',
                  args: ['server'],
                  securityContext: {
                    capabilities: {
                      add: ['IPC_LOCK'],
                    },
                  },
                  ports: [
                    {
                      name: 'vault-port',
                      containerPort: 8200,
                      protocol: 'TCP',
                    },
                    {
                      name: 'cluster-port',
                      containerPort: 8201,
                      protocol: 'TCP',
                    },
                  ],
                  resources: {
                    requests: {
                      cpu: '500m',
                      memory: '256Mi',
                    },
                  },
                  volumeMounts: [
                    {
                      name: 'vault-tls',
                      mountPath: '/etc/vault/tls',
                    },
                  ],
                  env: [
                    {
                      name: 'VAULT_ADDR',
                      value: 'http://127.0.0.1:8200',
                    },
                    {
                      name: 'POD_IP_ADDR',
                      valueFrom: {
                        fieldRef: {
                          fieldPath: 'status.podIP',
                        },
                      },
                    },
                    {
                      name: 'VAULT_LOCAL_CONFIG',
                      value: pulumi.interpolate`api_addr     = "https://${args.loadBalancerIp.address}"
cluster_addr = "https://$(POD_IP_ADDR):8201"
log_level = "warn"
ui = true
seal "gcpckms" {
  project    = "${args.keyRing.project}"
  region     = "${args.keyRing.location}"
  key_ring   = "${args.keyRing.name}"
  crypto_key = "${args.cryptoKey.name}"
}
storage "gcs" {
  bucket     = "${args.bucket.name}"
  ha_enabled = "true"
}
listener "tcp" {
  address     = "127.0.0.1:8200"
  tls_disable = "true"
}
listener "tcp" {
  address       = "$(POD_IP_ADDR):8200"
  tls_cert_file = "/etc/vault/tls/vault.crt"
  tls_key_file  = "/etc/vault/tls/vault.key"
  tls_disable_client_certs = true
}`,
                    },
                  ],
                  readinessProbe: {
                    initialDelaySeconds: 5,
                    periodSeconds: 5,
                    httpGet: {
                      path: '/v1/sys/health?standbyok=true',
                      port: 8200,
                      scheme: 'HTTPS',
                    },
                  },
                },
              ],
              volumes: [
                {
                  name: 'vault-tls',
                  secret: {
                    secretName: 'vault-tls',
                  },
                },
              ],
            },
          },
        },
      },
      {
        provider: args.provider,
      }
    ))();
}
