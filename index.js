import inquirer from "inquirer";
const { prompt } = inquirer;

import { Loader } from "./Loader.js";
const loader = new Loader();

import { fetch, FetchResultTypes as Types } from "@sapphire/fetch";

loader.on("packageDownloadError", (n, v, i, t, r) => {
  console.log(`An error ocurred when '${n}' named module downloading via '${i}'. (${r})`);
  process.exit(1);
});

loader.on("packageDownloaded", (n, v, i, t) => {
  console.log(`'${n}' named module downloaded with '${v}' version via '${i}'.`);
  process.exit(0);
});

loader.on("installerDownloadError", (n, err) => {
  console.log(`An error ocurred in '${n}' named installer installing. (${err})`);
  process.exit(1);
});

loader.on("installerDownloaded", (n) => {
  console.log(`'${n}' named installer downloaded.`);

  loader.on("packagesFound", (packages) => {
    const choices = [];
    for (let index = 0; index < packages.length; index++) {
      let module = packages[ index ];

      choices.push({ name: `${module.name} (${module.version})`, value: module });
    };

    prompt([
      {
        name: "package",
        type: "list",
        message: "Specify the package to install.",
        choices
      }
    ]).then(async (value) => {
      const versions = [];
      const response = await fetch(`https://registry.npmjs.com/${value.package.name}`, {}, Types.JSON);
      const versionList = Object.keys(response.versions);

      let tags = response["dist-tags"];

      for (let index = (versionList.length - 25); index < versionList.length; index++) {
        if (!versionList[ index ]) break;

        versions.push({ name: `${versionList[ index ]} ${versionList[ index ] === tags?.latest ? "(Latest Stable Version)" : (versionList[ index ] === tags?.dev ? "(Latest Development Version)" : "")}`, value: versionList[ index ] });
      };

      prompt([
        {
          name: "version",
          type: "list",
          message: "Specify the package version.",
          choices: versions
        }
      ]).then((data) => loader.downloadModule(value.package.name, data.version, n));
    });
  });

  prompt([
    {
      name: "module",
      message: "Enter the name of the package to be installed.",
      type: "input",
      transformer: (input) => input
    }
  ]).then((value) => loader.searchModule(value.module));
});

prompt([
  {
    name: "installer",
    message: "Select the package installer.",
    type: "expand",
    choices: [
      {
        name: "npm",
        value: "npm",
        key: "n"
      },
      {
        name: "pnpm",
        value: "pnpm",
        key: "p"
      },
      {
        name: "yarn",
        value: "yarn",
        key: "y"
      }
    ]
  }
]).then((value) => loader.downloadInstaller(value.installer));