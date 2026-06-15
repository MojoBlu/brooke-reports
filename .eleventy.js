import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import Image from "@11ty/eleventy-img";

export default function (eleventyConfig) {
  // Responsive images: generate multiple widths + formats from one source file.
  // Usage: {% image "/assets/images/foo.webp", "alt text", { sizes, widths, loading, fetchpriority, class } %}
  eleventyConfig.addNunjucksAsyncShortcode("image", async function (src, alt, options = {}) {
    const inputFile = src.startsWith("/") ? `src${src}` : src;
    const metadata = await Image(inputFile, {
      widths: options.widths || [560, 800, 1120],
      formats: options.formats || ["webp", "jpeg"],
      outputDir: "_site/assets/images/generated/",
      urlPath: "/assets/images/generated/",
    });

    const attributes = {
      alt: alt || "",
      sizes: options.sizes || "100vw",
      loading: options.loading || "lazy",
      decoding: "async",
    };
    if (options.fetchpriority) attributes.fetchpriority = options.fetchpriority;
    if (options.class) attributes.class = options.class;

    return Image.generateHTML(metadata, attributes);
  });

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy({ "src/favicon": "/" });
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/llms.txt");

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: {
      name: "posts",
      limit: 20,
    },
    metadata: {
      language: "en",
      title: "Brooke Reports",
      subtitle: "A cozy field guide to persuasion literacy, marketing psychology, attention traps, and clear thinking.",
      base: "https://brookereports.com/",
      author: {
        name: "Brookie",
      },
    },
  });

  eleventyConfig.addFilter("readableDate", (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  eleventyConfig.addFilter("htmlDateString", (date) => {
    return new Date(date).toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("limit", (arr, count) => arr.slice(0, count));
  eleventyConfig.addFilter("offset", (arr, n) => arr.slice(n));
  eleventyConfig.addFilter("except", (arr, url) => arr.filter(p => p.url !== url));

  eleventyConfig.addFilter("currentYear", () => new Date().getFullYear());
  eleventyConfig.addFilter("dateToISO", (date) => new Date(date).toISOString());

  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/posts/*.md").reverse();
  });

  eleventyConfig.addCollection("tagList", function (collectionApi) {
    const tags = new Set();
    collectionApi.getAll().forEach((item) => {
      (item.data.tags || []).forEach((tag) => {
        if (tag !== "post") tags.add(tag);
      });
    });
    return [...tags].sort();
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
