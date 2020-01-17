import * as gcp from '@pulumi/gcp';

interface VaultProjectArgs {
  projectServices: string[];
}

/**
 * Enable required services on the project.
 */
export default function enableProjectServices(
  args: VaultProjectArgs
): gcp.projects.Service[] {
  return args.projectServices.reduce((acc, cur) => {
    acc.push(
      new gcp.projects.Service(`${cur.replace('.', '-')}`, {
        disableDependentServices: true,
        service: cur,
        disableOnDestroy: false,
      })
    );
    return acc;
  }, [] as gcp.projects.Service[]);
}
