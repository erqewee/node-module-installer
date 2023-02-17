process.env.NODE_TLS_REJECT_UNAUTHORIZED = 1;

import inquirer from "inquirer";
const { prompt } = inquirer;

import { Loader } from "./Loader.js";
const loader = new Loader();

loader.on("packageDownloadError", (n, i, t, r) => {
  console.log(`An error ocurred when '${n}' named module downloading via '${i}'. (${r})`);
  process.exit(1);
});

loader.on("packageDownloaded", (n, i, t) => {
  console.log(`'${n}' named module downloaded via '${i}'.`);
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
  
      choices.push({ name: `${module.name} (${module.version})`, value: module.name });
    };
  
    prompt([
      {
        name: "package",
        type: "list",
        message: "Specify the package to install.",
        choices
      }
    ]).then((value) => loader.downloadModule(value.package, n));
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