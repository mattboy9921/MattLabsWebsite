# Runs PurgeCSS during build

Jekyll::Hooks.register :site, :post_write do |site|
  next unless Jekyll.env == "production"

  config = site.config["purgecss"] || {}

  css = config["css"] || ["_site/assets/css/main.css"]
  content = config["content"] || ["_site/**/*.html", "_site/**/*.js"]
  output = config["output"] || "_site/assets/css/"

  args = ["purgecss"]

  css.each do |path|
    args += ["--css", path]
  end

  content.each do |path|
    args += ["--content", path]
  end

  args += ["--output", output]

  success = system(*args, out: File::NULL, err: :out)

  unless success
    Jekyll.logger.error "PurgeCSS:", "failed"
  end
end