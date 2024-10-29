import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { chatCommand } from './commands/chat/index.js';
import { initCommand } from './commands/init/index.js';
import { checkForUpdates } from './update-notifier.js';

checkForUpdates();

void yargs(hideBin(process.argv))
  .command(chatCommand)
  .command(initCommand)
  .help()
  .demandCommand(1)
  .recommendCommands()
  .parse();
