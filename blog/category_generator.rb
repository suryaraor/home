# _plugins/category_generator.rb
# This plugin generates a page for each category automatically.
module Jekyll
  class CategoryPage < Page
    def initialize(site, base, dir, category)
      @site = site
      @base = base
      @dir  = dir
      @name = 'index.html'
      self.process(@name)
      self.read_yaml(File.join(base, 'blog'), 'category.html')
      self.data['category'] = category
      self.data['title'] = "Posts in category: #{category.capitalize}"
    end
  end

  class CategoryGenerator < Generator
    safe true
    def generate(site)
      site.categories.keys.each do |category|
        site.pages << CategoryPage.new(site, site.source, File.join('blog/category', category.downcase), category)
      end
    end
  end
end
