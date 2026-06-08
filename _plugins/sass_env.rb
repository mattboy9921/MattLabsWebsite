# Set Sass compression based on Jekyll environment

Jekyll::Hooks.register :site, :after_init do |site|
  if Jekyll.env == "production"
    site.config["sass"] ||= {}
    site.config["sass"]["style"] = "compressed"
  end
end