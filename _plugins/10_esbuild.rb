# frozen_string_literal: true

require "fileutils"
require "shellwords"

def esbuild_feature_enabled?(setting)
  case setting.to_s.downcase
  when "always", "true"
    true
  when "environment"
    ENV["JEKYLL_ENV"] == "production"
  when "never", "false"
    false
  else
    false
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  config = site.config["esbuild"] || {}

  next unless config.fetch("enabled", true)

  esbuild = config.fetch("script", "esbuild")
  minify = esbuild_feature_enabled?(config.fetch("minify", "never"))
  sourcemap = esbuild_feature_enabled?(config.fetch("sourcemap", "never"))
  files = config.fetch("files", [])

  if files.empty?
    Jekyll.logger.warn "ESBuild:", "No files configured."
    next
  end

  Jekyll.logger.info "ESBuild:", "Bundling #{files.length} file(s)..."

  files.each do |file|
    input = File.join(site.source, file["input"])
    output = File.join(site.dest, file["output"])

    unless File.exist?(input)
      Jekyll.logger.warn "ESBuild:", "Input not found: #{file["input"]}"
      next
    end

    FileUtils.mkdir_p(File.dirname(output))

    args = [
      esbuild,
      input,
      "--bundle",
      "--outfile=#{output}"
    ]

    args << "--minify" if minify
    args << "--sourcemap" if sourcemap

    output_text = `#{args.shelljoin} 2>&1`
    success = $?.success?

    unless success
      Jekyll.logger.error "ESBuild:", output_text
      raise "ESBuild failed for #{file["input"]}"
    end
  end

  Jekyll.logger.info "ESBuild:", "Complete."
end