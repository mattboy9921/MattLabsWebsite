# Runs Tenser for JS minification with source maps

# frozen_string_literal: true

require "terser"
require "json"
require "pathname"

module MattLabs
  class JsMinifier
    DEFAULTS = {
      "enabled" => true,
      "only_production" => true,
      "source_maps" => true,
      "include" => [
        "_site/assets/js/**/*.js"
      ],
      "exclude" => [
        "**/*.min.js",
        "**/*.map"
      ],
      # Terser args
      "terser" => {
        "compress" => true,
        "mangle" => true,
        "output" => {
          "comments" => "copyright"
        }
      }
    }.freeze

    def self.run(site)

      # Merge defaults with config values
      config = DEFAULTS.merge(site.config.fetch("js_minifier", {}))

      # Don't run if disabled
      return unless config["enabled"]
      # Run only in production
      return if config["only_production"] && ENV["JEKYLL_ENV"] != "production"

      # Search for JS files to minify
      files = matching_files(site, config)

      # Don't run if no JS files found
      if files.empty?
        return
      end

      # Set up Terser
      minifier = Terser.new(symbolize_keys(config["terser"] || {}))
      # Minify each file
      files.each do |path|
        minify_file(path, site.dest, minifier, config)
      end
    end

    # Find JS files matching include/exclude patterns
    def self.matching_files(site, config)
      include_patterns = Array(config["include"])
      exclude_patterns = Array(config["exclude"])

      # Expand include globs into file list
      files = include_patterns.flat_map do |pattern|
        Dir.glob(resolve_pattern(pattern, site))
      end.uniq
      # Keep only actual files
      files.select! { |file| File.file?(file) }

      # Remove excluded files
      files.reject do |file|
        relative = relative_path(file, site.dest)

        exclude_patterns.any? do |pattern|
          File.fnmatch?(pattern, relative, File::FNM_PATHNAME | File::FNM_EXTGLOB) ||
            File.fnmatch?(pattern, file, File::FNM_PATHNAME | File::FNM_EXTGLOB)
        end
      end
    end

    # Resolve relative/absolute include patterns
    def self.resolve_pattern(pattern, site)
      path = Pathname.new(pattern)
      # Already absolute
      return pattern if path.absolute?
      # Site relative, make absolute
      if pattern.start_with?("_site/")
        File.join(site.source, pattern)
      # Not site relative, make absolute
      else
        File.join(site.dest, pattern)
      end
    end

    # Minify a JS file
    def self.minify_file(path, destination, minifier, config)
      original = File.read(path)
      # Don't run if file is empty
      return if original.strip.empty?

      relative = relative_path(path, destination)
      map_path = "#{path}.map"
      map_file = "#{File.basename(path)}.map"

      if config["source_maps"]
        # Minify and create source map
        minified, source_map = minifier.compile_with_map(
          original,
          source_filename: relative,
          output_filename: relative
        )
        # Remove and add map URL
        minified = remove_existing_source_mapping_url(minified)
        minified += "\n//# sourceMappingURL=#{map_file}\n"
        # Write file
        File.write(path, minified)
        File.write(map_path, normalize_source_map(source_map, relative, File.basename(path)))
      else
        # Minify without map
        minified = minifier.compile(original)
        # Remove map URL
        minified = remove_existing_source_mapping_url(minified)
        # Write file
        File.write(path, minified)
      end

      Jekyll.logger.debug "JS Minifier:", "Minified #{relative}"
    rescue StandardError => e
      # Log errors
      Jekyll.logger.error "JS Minifier:", "Failed to minify #{relative_path(path, destination)}"
      Jekyll.logger.error "JS Minifier:", "#{e.class}: #{e.message}"
      raise e
    end

    # Remove old sourceMappingURL comments
    def self.remove_existing_source_mapping_url(js)
      js.gsub(%r{\n?//# sourceMappingURL=.*\z}, "")
    end

    # Normalize source map JSON
    def self.normalize_source_map(source_map, relative, file_name)
      map =
        case source_map
        when String
          JSON.parse(source_map)
        else
          source_map
        end

      map["file"] = file_name
      map["sources"] ||= [relative]

      JSON.pretty_generate(map)
    rescue JSON::ParserError
      source_map
    end

    # Convert absolute path into relative path to _site
    def self.relative_path(path, destination)
      Pathname.new(path)
             .relative_path_from(Pathname.new(destination))
             .to_s
    end

    # Convert config hash keys for Terser
    def self.symbolize_keys(value)
      case value
      when Hash
        value.each_with_object({}) do |(key, val), result|
          result[key.to_sym] = symbolize_keys(val)
        end
      when Array
        value.map { |item| symbolize_keys(item) }
      else
        value
      end
    end
  end
end
# Run after Jekyll finishes writing _site
Jekyll::Hooks.register :site, :post_write do |site|
  MattLabs::JsMinifier.run(site)
end