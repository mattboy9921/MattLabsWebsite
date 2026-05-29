# frozen_string_literal: true

# Cache busting by adding hash to cached files

require "digest"
require "cgi"

module MattLabs
  class CacheBustGeneratedHtml
    DEFAULT_CONFIG = {
      "enabled" => true,
      "parameter" => "v",
      "hash_length" => 12,
      "html_extensions" => [".html"],
      "css_extensions" => [".css"],
      "asset_extensions" => [
        ".css", ".js", ".mjs", ".map",
        ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif",
        ".svg", ".ico",
        ".woff", ".woff2", ".ttf", ".otf",
        ".mp4", ".webm", ".mp3", ".wav", ".pdf"
      ],
      "exclude_paths" => []
    }.freeze

    def self.run(site)

      # Merge defaults with config values
      config = DEFAULT_CONFIG.merge(site.config["cache_buster"] || {})
      # Don't run unless enabled
      return unless config["enabled"]

      # Site output directory
      dest = site.dest
      # Find all HTML files
      html_files = Dir.glob(File.join(dest, "**", "*")).select do |file|
        File.file?(file) && config["html_extensions"].include?(File.extname(file))
      end
      # Find all CSS files
      css_files = Dir.glob(File.join(dest, "**", "*")).select do |file|
        File.file?(file) &&
          config["css_extensions"].include?(File.extname(file))
      end

      # Process each HTML file
      html_files.each do |file|
        original = File.read(file)
        updated = bust_html(original, dest, config)

        File.write(file, updated) if updated != original
      end
      # Process each CSS file
      css_files.each do |file|
        original = File.read(file)
        updated = bust_css_urls(original, dest, config)

        File.write(file, updated) if updated != original
      end
    end

    # Process HTML content
    def self.bust_html(html, dest, config)
      html = bust_standard_attrs(html, dest, config)
      html = bust_srcset_attrs(html, dest, config)
      html
    end

    # Rewrite standard URL attributes
    # Handles: href, src, poster, data-src
    def self.bust_standard_attrs(html, dest, config)
      attrs = %w[href src poster data-src data-href]

      html.gsub(/(?<attr>#{attrs.join("|")})=(?<quote>["'])(?<url>.*?)(\k<quote>)/i) do
        attr = Regexp.last_match[:attr]
        quote = Regexp.last_match[:quote]
        url = Regexp.last_match[:url]

        "#{attr}=#{quote}#{busted_url(url, dest, config)}#{quote}"
      end
    end

    # Rewrite srcset
    # Handles: srcset="/image-small.webp 480w, /image-large.webp 1200w"
    def self.bust_srcset_attrs(html, dest, config)
      html.gsub(/(?<attr>srcset)=(?<quote>["'])(?<srcset>.*?)(\k<quote>)/i) do
        attr = Regexp.last_match[:attr]
        quote = Regexp.last_match[:quote]
        srcset = Regexp.last_match[:srcset]

        # Split
        busted_srcset = srcset.split(",").map do |entry|
          parts = entry.strip.split(/\s+/, 2)
          url = parts[0]
          descriptor = parts[1]

          new_url = busted_url(url, dest, config)
          descriptor ? "#{new_url} #{descriptor}" : new_url
        end.join(", ")

        "#{attr}=#{quote}#{busted_srcset}#{quote}"
      end
    end

    # Build cache-busted URL
    def self.busted_url(url, dest, config)

      # Ignore external URLs
      return url unless local_asset_url?(url, config)

      # Break apart
      path, query, fragment = split_url(url)
      # Skip excluded
      return url if excluded?(path, config)

      # Convert URL to file path
      file_path = File.join(dest, path.sub(%r{\A/}, ""))
      # Skip if file not found
      return url unless File.file?(file_path)

      # Compute hash
      hash = Digest::MD5.file(file_path).hexdigest[0, config["hash_length"]]
      param = config["parameter"]

      # Parse existing query string
      query_params = parse_query(query)
      # Remove old cache param if present
      query_params.reject! { |key, _| key == param }
      # Add new hash
      query_params << [param, hash]

      # Rebuild query string
      rebuilt_query = query_params.map do |key, value|
        "#{CGI.escape(key)}=#{CGI.escape(value)}"
      end.join("&amp;")

      # Reassemble URL
      result = "#{path}?#{rebuilt_query}"
      result += "##{fragment}" if fragment
      result
    end

    # Determine if URL is local
    def self.local_asset_url?(url, config)
      return false if url.nil? || url.empty?
      return false if url.start_with?("#")
      return false if url.match?(%r{\A[a-z][a-z0-9+\-.]*:}i) # http:, https:, data:, mailto:, etc.
      return false if url.start_with?("//")

      path = split_url(url).first
      config["asset_extensions"].include?(File.extname(path).downcase)
    end

    # Check exclusions
    def self.excluded?(path, config)
      config["exclude_paths"].any? { |excluded| path.start_with?(excluded) }
    end

    # Split URL into path, query and fragment
    def self.split_url(url)
      before_fragment, fragment = url.split("#", 2)
      path, query = before_fragment.split("?", 2)
      [path, query, fragment]
    end

    # Parse query string into key, value pairs
    def self.parse_query(query)
      return [] if query.nil? || query.empty?

      query.split("&").map do |pair|
        key, value = pair.split("=", 2)
        [CGI.unescape(key.to_s), CGI.unescape(value.to_s)]
      end
    end

    # Rewrite CSS URLs
    def self.bust_css_urls(css, dest, config)
      css.gsub(/url\((?<quote>["']?)(?<url>.*?)(\k<quote>)\)/i) do
        quote = Regexp.last_match[:quote]
        url = Regexp.last_match[:url].strip

        "url(#{quote}#{busted_url(url, dest, config)}#{quote})"
      end
    end
  end
end

# Run after _site generated
Jekyll::Hooks.register :site, :post_write do |site|
  MattLabs::CacheBustGeneratedHtml.run(site)
end