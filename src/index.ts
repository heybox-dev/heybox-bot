import { CommandManager } from 'gugle-command';
import { EventManager } from 'gugle-event';

class CustomCommandManager extends CommandManager {
  public constructor() {
    super();
  }
}

class Plugin {
  private readonly single: boolean;

  public constructor(single: boolean = false) {
    this.single = single;
  }

  public isSingle(): boolean {
    return this.single;
  }
}

class PluginManager {
  public readonly plugins: Plugin[] = [];
  public readonly bot: BlackBoxBot;
  private readonly single: boolean;

  public constructor(bot: BlackBoxBot, single: boolean) {
    this.bot = bot;
    this.single = single;
  }

  public registerPlugin(plugin: Plugin): PluginManager {
    this.plugins.push(plugin);
    return this;
  }

  public load(plugin: Plugin): PluginManager {
    // ...
    return this;
  }

  public unload(plugin: Plugin): PluginManager {
    // ...
    return this;
  }

  public getPlugins(): Plugin[] {
    return this.plugins;
  }
}

export class BlackBoxBot {
  private static instance: BlackBoxBot;
  private readonly commandManager: CustomCommandManager;
  private readonly eventManager: EventManager;
  private readonly pluginManager: PluginManager;

  private constructor(single: boolean = false) {
    this.commandManager = new CustomCommandManager();
    this.eventManager = new EventManager();
    this.pluginManager = new PluginManager(this, single);
  }

  public static getInstance(): BlackBoxBot {
    if (!BlackBoxBot.instance) BlackBoxBot.instance = new BlackBoxBot();
    return BlackBoxBot.instance;
  }

  public static loadPlugin(plugin: Plugin): BlackBoxBot {
    let bot = plugin.isSingle() ? new BlackBoxBot() : BlackBoxBot.getInstance();
    bot.pluginManager.load(plugin);
    return bot;
  }

  public async start(): Promise<BlackBoxBot> {
    // ...
    return this;
  }

  public stop(): BlackBoxBot {
    // ...
    return this;
  }

  /**
   * @useage @bot.command('/test command {arg0: NUMBER} run {arg1: STRING} set {arg2: BOOLEAN}')
   *         function testCommand(arg0: number, arg1: string, arg2: boolean) {}
   */
  public command(namespace: string, command: string): Function {
    const self = this;
    return function (executor: Function) {
      if (!command.startsWith(self.commandManager.prefix)) {
        throw new Error('Invalid command');
      }
      const commands = command.substring(self.commandManager.prefix.length);
      const nodes = commands.split(' ');
      if (nodes.length <= 0) {
        throw new Error('Invalid command');
      }
      let root = undefined;
      for (const node of nodes) {
        if (!root) {
          if (node.startsWith('{') || node.endsWith('}')) {
            throw new Error('Invalid command, root node can not be argument node!');
          }
          root = self.commandManager.literal(node);
        }
      }
      self.commandManager.register(namespace, root!);
    };
  }

  /**
   * @useage @BlackBoxBot.command('/test command {arg0: NUMBER} run {arg1: STRING} set {arg2: BOOLEAN}')
   *         function testCommand(arg0: number, arg1: string, arg2: boolean) {}
   */
  public static command(namespace: string, command: string): Function {
    return BlackBoxBot.getInstance().command(namespace, command);
  }
}
