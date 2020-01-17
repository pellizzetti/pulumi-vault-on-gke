import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();

/**
 * Number of Vault pods to run. Anti-affinity rules spread pods across
 * available nodes. Please use an odd number for better availability.
 * @default 3
 */
export const numVaultPods = config.getNumber('numVaultPods') || 3;

/**
 * Name of the Vault container image to deploy. This can be specified like
 * `container:version` or as a full container URL.
 * @default 'vault:1.2.1'
 */
export const vaultContainer = config.get('vaultContainer') || 'vault:1.2.1';

/**
 * Name of the Vault init container image to deploy. This can be specified like
 * `container:version` or as a full container URL.
 * @default 'sethvargo/vault-init:1.0.0'
 */
export const vaultInitContainer =
  config.get('vaultInitContainer') || 'sethvargo/vault-init:1.0.0';

/**
 * Number of recovery keys to generate.
 * @default '1'
 */
export const vaultRecoveryKeys = config.get('vaultRecoveryKeys') || '1';

/**
 * Number of recovery keys required for quorum. This must be less than
 * or equal to `vaultRecoveryKeys`.
 * @default '1'
 */
export const vaultRecoveryThreshold =
  config.get('vaultRecoveryThreshold') || '1';
