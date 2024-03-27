# Parses JSON into objects

require 'json'

module Jekyll
  module JsonFilter
    def parse_json(input)
      JSON.parse(input)
    end
  end
end

Liquid::Template.register_filter(Jekyll::JsonFilter)