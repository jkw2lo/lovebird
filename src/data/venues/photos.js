// Photo references for researched venues. Always links, never copies.

// A Wikipedia article's lead photo from Wikimedia Commons (credited to the article).
export const wiki = (file, page) => ({
  url: `https://upload.wikimedia.org/wikipedia/commons/thumb/${file}/960px-${file.split('/').pop()}`,
  credit: 'Wikimedia Commons',
  creditUrl: `https://en.wikipedia.org/wiki/${page}`,
});

// Any Commons file, credited with its license and linked to its file page.
export const commons = (file, license, caption = null) => ({
  url: `https://upload.wikimedia.org/wikipedia/commons/thumb/${file}/960px-${file.split('/').pop()}`,
  credit: `Wikimedia Commons (${license})`,
  creditUrl: `https://commons.wikimedia.org/wiki/File:${decodeURIComponent(file.split('/').pop())}`,
  caption,
});

// The venue's own preview image from its website.
export const site = (url, credit) => ({ url, credit, creditUrl: null });
