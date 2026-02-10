export class Embed {
  constructor({ id, name, pathname, redirections, ref, manifestPath, manifestSha, localesDirectories, configDirectory }) {
    this.id = id;
    this.name = name;
    this.pathname = pathname;
    this.redirections = redirections && new EmbedRedirections(redirections);
    this.ref = ref;
    this.manifestPath = manifestPath;
    this.manifestSha = manifestSha;
    this.localesDirectories = localesDirectories;
    this.configDirectory = configDirectory;
  }
}

export class EmbedRedirections {
  constructor({ defaults, patterns, search }) {
    this.defaults = defaults;
    this.patterns = patterns.map((pattern) => new URLPattern(pattern));
    this.search = search;
  }
}
