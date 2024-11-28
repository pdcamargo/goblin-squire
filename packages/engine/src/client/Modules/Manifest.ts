import { Assert } from "../Assert";

export type ModuleManifestOptions = Omit<ModuleManifest, "constructor">;

export class ModuleManifest implements ModuleManifestOptions {
  /**
   * The unique identifier of the module.
   *
   * For local development or manual installation, this can be any string. But
   * if you are planning to publish the module to the repository for easier installation,
   * this value will be checked for uniqueness before publishing.
   */
  id: string;

  /**
   * The name of the module. It can be any string but can't be empty.
   */
  name: string;

  /**
   * The description of the module. It can be any string but can't be empty. Use this to
   * describe what the module does and how it can be used. `Markdown` is supported.
   */
  description: string;

  /**
   * The version of the module.
   *
   * This should follow the semantic versioning format and will throw an error if it doesn't.
   *
   * The semantic versioning is used to better communicate the changes in the module to the users.
   */
  version: string;

  /**
   * The compatibility key is used to specify the minimum and maximum versions of the
   * engine required for the module to work. It can also be used to specify a list of
   * versions that have been verified to work with the module to make the users feel
   * more confident about using the module.
   *
   * If this key is set to "all", it means that the module is compatible with all versions.
   * And it means all of your changes are backward-compatible.
   *
   * If this key is set to "lts", it means that the module is compatible with only the LTS version and
   * changes are not necessarily backward-compatible.
   *
   * If compatibility is not set, the module will still be installable, but it will show a warning
   * to the user that the module may not work with their version of the engine.
   */
  compatibility?:
    | {
        /**
         * Minimum version of the engine required for the module to work.
         *
         * This can be optional, but if both `minimumVersion` and `maximumVersion` are
         * empty, it will throw an error. In this case, you should remove the `compatibility`
         * key from the manifest.
         */
        mininumVersion?: string;

        /**
         * Maximum version of the engine required for the module to work.
         *
         * This can be optional, but if both `minimumVersion` and `maximumVersion` are
         * empty, it will throw an error. In this case, you should remove the `compatibility`
         * key from the manifest.
         */
        maximumVersion?: string;

        /**
         * List of versions that have been verified to work with the module.
         *
         * This will simply be a badge on the module's page and will not affect
         * compatibility checks. So even though it's optional, it's recommended
         * to include it.
         */
        verifiedVersions?: string[] | string | null;
      }
    | "all"
    | "lts";

  /**
   * The authors of the module. This is simply if you want to give credit to the people
   * or add a easy way to contact them. It can be empty if you are the only author.
   */
  authors?: Array<{
    name: string;

    email?: string;

    /**
     * URL to the author's website or profile.
     *
     * The key will be used as the link text and the value as the URL.
     */
    urls: Record<string, string>;

    /**
     * If the author is the owner of the module (simply for credit and visibility).
     */
    owner?: boolean;
  }>;

  constructor(options: ModuleManifestOptions) {
    this.id = options.id;
    this.name = options.name;
    this.description = options.description;
    this.version = options.version;
    this.compatibility = options.compatibility;
    this.authors = options.authors;

    Assert.isString(this.id, "Module ID must be a string.");
    Assert.isString(this.name, "Module name must be a string.");
    Assert.isString(this.description, "Module description must be a string.");
    Assert.isString(this.version, "Module version must be a string.");
  }
}
