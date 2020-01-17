import * as pulumi from '@pulumi/pulumi';
import * as fs from 'fs';

import { Provisioner } from './provisioner';

export interface SaveToFileArgs {
  path: string;
  content: string | pulumi.Output<string>;
  permission?: string;
  append?: boolean;
}

function saveToFile(
  args: SaveToFileArgs
): {
  success: boolean;
} {
  const options = { flag: 'w' };
  if (args.append) {
    options.flag = 'a';
  }

  try {
    fs.writeFileSync(args.path, args.content, options);
  } catch (err) {
    return { success: false };
  }

  if (args.permission) {
    try {
      fs.chmodSync(args.path, args.permission);
    } catch (err) {
      return { success: false };
    }
  }

  return { success: true };
}

export interface SaveToFileResult {
  success: boolean;
}

export class SaveToFile extends pulumi.ComponentResource {
  private readonly provisioner: Provisioner<SaveToFileArgs, SaveToFileResult>;

  public readonly result: pulumi.Output<SaveToFileResult>;

  constructor(
    name: string,
    args: SaveToFileArgs,
    opts?: pulumi.ComponentResourceOptions
  ) {
    super('pulumi:provisioners:SaveToFile', name, args, opts);

    this.provisioner = new Provisioner<SaveToFileArgs, SaveToFileResult>(
      `${name}-provisioner`,
      {
        dep: args,
        onCreate: (
          onCreateArgs: pulumi.UnwrappedObject<SaveToFileArgs>
        ): { success: boolean } => saveToFile(onCreateArgs),
      },
      { parent: this }
    );

    this.result = this.provisioner.result;
  }
}
