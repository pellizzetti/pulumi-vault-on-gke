import * as gcp from '@pulumi/gcp';

interface VaultServiceAccountArgs {
  serviceAccountIamRoles: string[];
  serviceAccountCustomIamRoles: string[];
}

/**
 * Create Vault service account, a service account key, add the service account
 * to the project and user-specified roles.
 */
export default function createServiceAccount(
  args: VaultServiceAccountArgs
): {
  serviceAccount: gcp.serviceAccount.Account;
  appliedServiceAccountIamRoles: gcp.projects.IAMMember[];
  appliedServiceAccountCustomIamRoles: gcp.projects.IAMMember[];
} {
  const serviceAccount = new gcp.serviceAccount.Account('vault-server', {
    accountId: 'vault-server',
    displayName: 'Vault Server',
  });

  ((): gcp.serviceAccount.Key =>
    new gcp.serviceAccount.Key(
      'vault',
      {
        serviceAccountId: serviceAccount.accountId,
      },
      {
        additionalSecretOutputs: ['privateKey'],
      }
    ))();

  const appliedServiceAccountIamRoles = args.serviceAccountIamRoles.reduce(
    (acc, cur) => {
      acc.push(
        new gcp.projects.IAMMember(`vault-${cur.replace(/[/.]/g, '-')}`, {
          member: serviceAccount.email.apply(
            email => `serviceAccount:${email}`
          ),
          role: cur,
        })
      );
      return acc;
    },
    [] as gcp.projects.IAMMember[]
  );

  const appliedServiceAccountCustomIamRoles = args.serviceAccountCustomIamRoles.reduce(
    (acc, cur) => {
      acc.push(
        new gcp.projects.IAMMember(`vault-${cur.replace(/[/.]/g, '-')}`, {
          member: serviceAccount.email.apply(
            email => `serviceAccount:${email}`
          ),
          role: cur,
        })
      );
      return acc;
    },
    [] as gcp.projects.IAMMember[]
  );

  return {
    serviceAccount,
    appliedServiceAccountIamRoles,
    appliedServiceAccountCustomIamRoles,
  };
}
