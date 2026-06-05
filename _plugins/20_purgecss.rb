# Runs PurgeCSS during production builds.
# Builds a map of:
#   CSS file -> HTML files that link it
#            -> JS files linked by those HTML files

require "set"
require "nokogiri"

Jekyll::Hooks.register :site, :post_write do |site|
  next unless Jekyll.env == "production"

  config = site.config["purgecss"] || {}

  site_dest = site.dest
  output_dir = config["output"] || File.join(site_dest, "assets/css")

  css_map = Hash.new do |hash, css_file|
    hash[css_file] = {
      html: Set.new,
      js: Set.new
    }
  end

  html_files = Dir.glob(File.join(site_dest, "**/*.html"))

  html_files.each do |html_file|
    html = File.read(html_file)
    doc = Nokogiri::HTML(html)

    css_files = doc.css('link[rel="stylesheet"][href]').filter_map do |link|
      href = link["href"]
      next if href.nil?
      next if href.start_with?("http://", "https://", "//")

      clean_href = href.split("?").first.split("#").first
      css_path = File.join(site_dest, clean_href.sub(%r{^/}, ""))

      File.exist?(css_path) ? css_path : nil
    end

    js_files = doc.css("script[src]").filter_map do |script|
      src = script["src"]
      next if src.nil?
      next if src.start_with?("http://", "https://", "//")

      clean_src = src.split("?").first.split("#").first
      js_path = File.join(site_dest, clean_src.sub(%r{^/}, ""))

      File.exist?(js_path) ? js_path : nil
    end

    css_files.each do |css_file|
      css_map[css_file][:html] << html_file

      js_files.each do |js_file|
        css_map[css_file][:js] << js_file
      end
    end
  end

  if css_map.empty?
    Jekyll.logger.warn "PurgeCSS:", "No local CSS files found in generated HTML."
    next
  end

  Jekyll.logger.info "PurgeCSS:", "Processing #{css_map.size} CSS file(s)..."

  css_map.each do |css_file, files|
    args = ["purgecss"]

    args += ["--css", css_file]

    files[:html].each do |html_file|
      args += ["--content", html_file]
    end

    files[:js].each do |js_file|
      args += ["--content", js_file]
    end

    args += ["--output", output_dir]

    success = system(*args, out: File::NULL, err: :out)

    unless success
      Jekyll.logger.error "PurgeCSS:", "Failed for #{File.basename(css_file)}"
    end
  end

  Jekyll.logger.info "PurgeCSS:", "Complete."
end