import { exec } from "node:child_process";

import { createInterface } from "node:readline";

import got from "got";

import ora from "ora";

const rl = createInterface({ input: process.stdin, output: process.stdout });

rl.question("Module Installer: ", async (i) => {
  const installer = i.trim().toLowerCase();

  let checker = ora(`'{installer}' installer is checking...`).start();

  if (installer == "pnpm") downloadInstaller(checker, installer)
  else if (installer == "yarn") downloadInstaller(checker, installer)
  else if (installer == "npm") downloadInstaller(checker, installer)
  else {
    checker.fail(`'${installer}' is not valid. (It can only be one of the 'yarn', 'npm', 'pnpm' installer.)`);
    process.exit(1);
  };
});

function installModule(provider) {
  rl.question("Module Name: ", async (n) => {
    const name = n.trim().toLowerCase();

    let spinner = ora(`Searching '${name}' module in 'NPM'.`).start();

    got(`https://registry.npmjs.com/${name}`).json().then(() => {
      spinner.succeed(`'${name}' module found.`);

      exec(`${provider} install`);

      rl.question("Global (If it's not global, leave it blank): ", (isGlobal) => {
        const startedTime = Date.now();
        let globalModule = false;

        spinner = spinner.render().start(`'${name}' module installing.`);

        if (isGlobal) globalModule = true;

        exec(globalModule ? `${provider} add ${name}@latest --global` : `${provider} add ${name}@latest`, (err, out, sterr) => {
          if (sterr) {
            spinner.fail(`An error occurred while downloading the '${name}' module. (${sterr})`);
            process.exit(1);
          } else {
            const endedTime = Date.now();
            spinner.succeed(`'${name}' module installed successful. (${endedTime - startedTime}s)`);
            process.exit(0);
          };
        });
      });
    }).catch((reason) => {
      spinner.fail(`A module '${name}' could not be found. Check the name and try again.`);
      process.exit(1);
    });
  });
};

function downloadInstaller(spinner, installer) {
  spinner.text = `The '${installer}' installer has been verified.`;

  exec(`${installer}`, async (err, out, sterr) => {
    if (sterr) {
      spinner.fail(`'${installer}' is not installed.`);

      await (new Promise((r) => setTimeout(r, 3000)));

      spinner = spinner.render().start(`'${installer}' is installing. Please wait a few seconds...`);

      exec(`npm install --global ${installer}@latest`, (error, sout, serr) => {
        if (!serr) {
          spinner.succeed(`'${installer}' is installed successful.`);
          installModule(installer);
        } else {
          spinner.fail(`An error occurred while downloading the '${installer}' installer.`);
          process.exit(1);
        };
      });
    } else {
      spinner.succeed(`'${installer}' is already installed.`);
      installModule(installer);
    };
  });
};
