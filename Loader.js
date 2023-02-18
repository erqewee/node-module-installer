import { exec } from "node:child_process";
import EventEmitter from "node:events";

import {
  fetch,
  FetchMethods as Methods,
  FetchResultTypes as Types
} from "@sapphire/fetch";

export class Loader extends EventEmitter {
  constructor(captureRejections = true) {
    super({ captureRejections });
  };

  /**
   * Download package from 'registry.npmjs.com'
   * @param {string} name
   * @returns {void}
   */
  downloadModule(name, version, installer = "npm", type = "package") {
    fetch(`https://registry.npmjs.com/${name}`).then(() => {
      exec(`${installer} ${type === "global" ? "add --global" : "add"} ${name}@${version}`, (err, stdout, stderr) => {
        if (stderr) this.emit("packageDownloadError", name, version, installer, type, stderr);
        else this.emit("packageDownloaded", name, version, installer, type);
      });
    }).catch((reason) => this.emit("packageDownloadError", name, version, installer, type, reason));
  };

  /**
   * Search module.
   * @param {string} name 
   * @returns {Promise<void>}
   */
  async searchModule(name) {
    await (fetch(`https://www.npmjs.com/search/suggestions?q=${name}&size=20`, { method: Methods.Get }, Types.JSON)).then((results) => this.emit("packagesFound", results)).catch((reason) => this.emit("searchModuleError", reason));

    return void 0;
  };

  /**
   * Download package installer.
   * @param {string} name 
   * @returns {void}
   */
  downloadInstaller(name) {
    exec(name, (er, std, sterr) => {
      if (sterr) exec(`npm install --global ${name}@latest`, (e, stdout, stderr) => {
        if (stderr) this.emit("installerDownloadError", name, stderr);
        else this.emit("installerDownloaded", name);
      });
      else this.emit("installerDownloaded", name);
    });

    return void 0;
  };
};