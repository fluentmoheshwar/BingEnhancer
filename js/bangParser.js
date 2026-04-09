/**
 * Bang Parser for Bing Enhancer
 * Extracts and validates bangs from search queries
 */

class BangParser {
  constructor(bangsMap) {
    // Map of bang tags to their URLs
    // bangsMap should be: { "g": "https://www.google.com/search?q={{{s}}}", ... }
    this.bangsMap = bangsMap || {};
  }

  /**
   * Extract bang from a search query
   * Supports both ! and # prefixes, at start or end
   * @param {string} query - The search query
   * @returns {Object} { bang: string|null, cleanQuery: string, url: string|null }
   */
  parse(query) {
    if (!query || typeof query !== "string") {
      return { bang: null, cleanQuery: query, url: null };
    }

    const trimmed = query.trim();
    let bang = null;
    let cleanQuery = trimmed;

    // Pattern: matches ! or # followed by alphanumeric characters, followed by word boundary
    // Examples: !g, !gh, #g, #gh, etc.
    const bangPattern = /[!#]([a-zA-Z0-9\-]+)/g;

    let match;
    const matches = [];
    while ((match = bangPattern.exec(trimmed)) !== null) {
      matches.push({
        full: match[0], // e.g., "!g" or "#gh"
        tag: match[1], // e.g., "g" or "gh"
        index: match.index,
        length: match[0].length,
      });
    }

    // Process matches: longest first (to handle !gh before !g)
    // Sort by tag length descending
    matches.sort((a, b) => b.tag.length - a.tag.length);

    // Find first valid bang
    for (const m of matches) {
      if (this.bangsMap.hasOwnProperty(m.tag)) {
        bang = m.tag;
        // Remove the bang from the query (including the ! or # prefix)
        cleanQuery = (
          trimmed.substring(0, m.index) +
          " " +
          trimmed.substring(m.index + m.length)
        ).trim();
        break;
      }
    }

    // If no valid bang found, return original query
    if (!bang) {
      return { bang: null, cleanQuery: trimmed, url: null };
    }

    // Get the URL template and replace {{{s}}} with encoded query
    const urlTemplate = this.bangsMap[bang];
    if (!urlTemplate) {
      return { bang: null, cleanQuery: trimmed, url: null };
    }

    // Encode the clean query for URI
    const encodedQuery = encodeURIComponent(cleanQuery);
    const url = urlTemplate.replace(/{{{s}}}/g, encodedQuery);

    return { bang, cleanQuery, url };
  }

  /**
   * Validate if a bang exists
   * @param {string} tag - The bang tag without ! or #
   * @returns {boolean}
   */
  isValidBang(tag) {
    return this.bangsMap.hasOwnProperty(tag);
  }

  /**
   * Get URL for a specific bang and query
   * @param {string} tag - The bang tag
   * @param {string} query - The search query
   * @returns {string|null}
   */
  getUrl(tag, query) {
    if (!this.isValidBang(tag) || !query) {
      return null;
    }
    const urlTemplate = this.bangsMap[tag];
    const encodedQuery = encodeURIComponent(query);
    return urlTemplate.replace(/{{{s}}}/g, encodedQuery);
  }
}

// Export for use
if (typeof module !== "undefined" && module.exports) {
  module.exports = BangParser;
}
